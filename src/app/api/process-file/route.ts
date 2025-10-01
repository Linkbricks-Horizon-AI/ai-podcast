import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import * as xml2js from 'xml2js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to extract text from PPTX files
async function extractTextFromPPTX(buffer: Buffer): Promise<string> {
  try {
    const zip = new JSZip();
    await zip.loadAsync(buffer);
    
    const slideTexts: string[] = [];
    const slideFiles = Object.keys(zip.files).filter(name => 
      name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
    );
    
    // Sort slide files to maintain order
    slideFiles.sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)?.[1] || '0');
      const numB = parseInt(b.match(/slide(\d+)/)?.[1] || '0');
      return numA - numB;
    });
    
    for (const slideFile of slideFiles) {
      const slideXml = await zip.files[slideFile].async('string');
      const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });
      const result = await parser.parseStringPromise(slideXml);
      
      // Extract text from slide
      const texts: string[] = [];
      const extractText = (obj: unknown): void => {
        if (typeof obj === 'string') {
          texts.push(obj);
        } else if (typeof obj === 'object' && obj !== null) {
          const objAsRecord = obj as Record<string, unknown>;
          for (const key in objAsRecord) {
            if (key === 't') { // Text element in PowerPoint XML
              if (Array.isArray(objAsRecord[key])) {
                texts.push(...(objAsRecord[key] as string[]));
              } else {
                texts.push(objAsRecord[key] as string);
              }
            } else {
              extractText(objAsRecord[key]);
            }
          }
        }
      };
      
      extractText(result);
      
      if (texts.length > 0) {
        const slideNumber = slideFile.match(/slide(\d+)/)?.[1] || '0';
        slideTexts.push(`\n=== Slide ${slideNumber} ===\n${texts.join(' ')}`);
      }
    }
    
    return slideTexts.join('\n');
  } catch (error) {
    console.error('Error parsing PPTX:', error);
    throw new Error('Failed to parse PPTX file');
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('Process file API called');
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    console.log('File received:', file ? `${file.name} (${file.type})` : 'No file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file size
    const maxFileSizeMB = parseInt(process.env.MAX_UPLOAD_FILE_SIZE || '20');
    const fileSizeMB = file.size / (1024 * 1024);
    
    if (fileSizeMB > maxFileSizeMB) {
      return NextResponse.json({ 
        error: `File size exceeds ${maxFileSizeMB}MB limit` 
      }, { status: 400 });
    }

    // Process based on file type
    const fileType = file.type;
    let content: string;
    let title: string = file.name;

    // Process documents directly without Assistant API
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Handle PDF files
    if (fileType === 'application/pdf') {
      try {
        // Try dynamic import for pdf-parse
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(buffer);
        content = data.text;
        console.log('PDF parsed successfully, pages:', data.numpages);
      } catch (error) {
        console.error('Error parsing PDF:', error);
        // Fallback: inform user that PDF needs to be converted
        content = `PDF 파일 (${file.name})을 처리할 수 없습니다. PDF 파일을 텍스트 파일로 변환하거나 이미지로 캡처하여 다시 시도해주세요.`;
      }
      
    // Handle Excel files (XLSX, XLS, CSV)
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileType === 'application/vnd.ms-excel' ||
      fileType === 'text/csv'
    ) {
      try {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheets: string[] = [];
        
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const sheetContent = XLSX.utils.sheet_to_csv(worksheet);
          sheets.push(`=== ${sheetName} ===\n${sheetContent}`);
        });
        
        content = sheets.join('\n\n');
        console.log('Excel file parsed successfully, sheets:', workbook.SheetNames.length);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        throw new Error('Failed to parse Excel file');
      }
      
    // Handle Word files (DOCX)
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword'
    ) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        content = result.value;
        if (result.messages.length > 0) {
          console.log('Word document warnings:', result.messages);
        }
        console.log('Word document parsed successfully');
      } catch (error) {
        console.error('Error parsing Word document:', error);
        throw new Error('Failed to parse Word document');
      }
      
    // Handle PowerPoint files (PPTX)
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      fileType === 'application/vnd.ms-powerpoint'
    ) {
      try {
        content = await extractTextFromPPTX(buffer);
        console.log('PowerPoint file parsed successfully');
        
        // If no text was extracted, provide a fallback message
        if (!content || content.trim() === '') {
          content = `PowerPoint 파일 (${file.name})에서 텍스트를 추출할 수 없습니다. 파일이 비어있거나 이미지로만 구성되어 있을 수 있습니다.`;
        }
      } catch (error) {
        console.error('Error parsing PowerPoint:', error);
        content = `PowerPoint 파일 (${file.name})을 파싱하는 중 오류가 발생했습니다. 파일이 손상되었거나 보호되어 있을 수 있습니다.`;
      }
      
    } else if (fileType.startsWith('image/')) {
      // Process image with OpenAI Vision API  
      const base64Image = buffer.toString('base64');
      
      // Create proper data URL with base64 encoding
      const dataUrl = `data:${fileType};base64,${base64Image}`;
      
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: '이 이미지를 자세히 분석하고 한국어로 설명해주세요. 이미지에 포함된 모든 요소를 설명하고, 텍스트가 있다면 모두 추출해주세요. 이미지의 주제, 구성, 색상, 객체, 인물, 배경, 분위기 등을 상세히 설명해주세요. 차트나 그래프가 있다면 데이터를 해석해주시고, 문서라면 내용을 요약해주세요.',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: dataUrl,
                    detail: 'high' // Add high detail for better analysis
                  },
                },
              ],
            },
          ],
          max_tokens: 4000,
        });

        if (!response.choices[0].message.content) {
          throw new Error('No content received from OpenAI Vision API');
        }

        content = response.choices[0].message.content;
        
        // Log for debugging
        console.log('Image analysis successful, content length:', content.length);
        
      } catch (error) {
        console.error('Error analyzing image with OpenAI Vision:', error);
        
        // Fallback error message
        content = `이미지 분석 중 오류가 발생했습니다. 파일명: ${file.name}, 크기: ${(file.size / 1024).toFixed(2)}KB, 형식: ${fileType}`;
        
        if (error instanceof Error) {
          content += `\n오류 내용: ${error.message}`;
        }
      }
      
    } else if (fileType === 'text/plain' || fileType === 'text/markdown' || fileType === 'text/csv') {
      // Process text file
      content = await file.text();
      
    } else {
      // For other document types, try to read as text
      try {
        content = await file.text();
      } catch {
        return NextResponse.json({ 
          error: 'Unable to process this file type. Please use supported formats.' 
        }, { status: 400 });
      }
    }

    // Generate a better title if needed
    if (content.length > 100) {
      try {
        const titleResponse = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: '주어진 내용을 읽고 적절한 제목을 한국어로 생성해주세요. 제목만 반환하고 다른 설명은 하지 마세요.',
            },
            {
              role: 'user',
              content: content.substring(0, 1000),
            },
          ],
          max_tokens: 100,
        });

        if (titleResponse.choices[0].message.content) {
          title = titleResponse.choices[0].message.content.trim();
        }
      } catch (error) {
        console.error('Error generating title:', error);
        // Keep original filename as title if generation fails
      }
    }

    return NextResponse.json({
      content,
      title,
    });
    
  } catch (error) {
    console.error('Error processing file:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Return a more detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
    const errorDetails = error instanceof Error ? error.stack : String(error);
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    );
  }
}
