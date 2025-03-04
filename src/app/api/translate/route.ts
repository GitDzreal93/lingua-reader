import { NextResponse } from 'next/server';

// 延时函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 轮询对话状态
async function pollChatStatus(conversationId: string, chatId: string, token: string) {
  let attempts = 0;
  const maxAttempts = 15; // 每2秒一次，最多轮询15次，总共30秒
  const pollInterval = 2000; // 轮询间隔2秒

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(
        `https://api.coze.cn/v3/chat/retrieve?conversation_id=${conversationId}&chat_id=${chatId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Poll status failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('Poll status response:', data);

      if (data.data?.status === 'completed') {
        console.log('Chat completed, proceeding to get messages...');
        return true;
      }

      // 等待2秒再次轮询
      await delay(pollInterval);
      attempts++;
      console.log(`Polling attempt ${attempts}/${maxAttempts}...`);
    } catch (error) {
      console.error('Poll status error:', error);
      throw error;
    }
  }

  throw new Error('Polling timeout after 30 seconds');
}

// 获取对话详情
async function getChatMessages(conversationId: string, chatId: string, token: string) {
  try {
    const response = await fetch(
      `https://api.coze.cn/v3/chat/message/list?conversation_id=${conversationId}&chat_id=${chatId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Get messages failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Chat messages response:', data);

    // 查找 type=answer 的消息
    const answerMessage = data.data?.find((msg: any) => msg.type === 'answer');
    if (!answerMessage) {
      throw new Error('No answer message found in response');
    }

    try {
      // 1. 移除多余的换行符和空格
      let cleanContent = answerMessage.content
        .replace(/\\n\s+/g, '')
        .replace(/\n\s+/g, '');
      
      // 2. 处理内部的转义引号
      cleanContent = cleanContent
        .replace(/\\\\/g, '\\')  // 处理双重转义的反斜杠
        .replace(/\\"/g, '"')    // 处理转义的引号
        .replace(/"([^"]*)"(?=[,}])/g, function(match: string) {
          // 将内部的引号替换为单引号
          return match.replace(/\\"/g, "'");
        });

      console.log('Cleaned content:', cleanContent);
      
      // 3. 尝试直接解析
      try {
        const content = JSON.parse(cleanContent);
        console.log('Parsed content:', content);
        return {
          en: Array.isArray(content.en) ? content.en : [],
          zh: Array.isArray(content.zh) ? content.zh : [],
          words: Array.isArray(content.words) ? content.words.map((word: any) => ({
            word: word.word || '',
            type: word.type || 'Unknown',
            meaning: word.meaning || ''
          })) : []
        };
      } catch (parseError) {
        // 4. 如果直接解析失败，尝试手动解析
        console.log('Direct parsing failed, trying manual parsing...');
        const matches = cleanContent.match(/{[\s\S]*"en":\s*\[([\s\S]*?)\],[\s\S]*"zh":\s*\[([\s\S]*?)\],[\s\S]*"words":\s*\[([\s\S]*?)\][\s\S]*}/);
        
        if (matches) {
          const [, enPart, zhPart, wordsPart] = matches;
          const en = JSON.parse(`[${enPart}]`);
          const zh = JSON.parse(`[${zhPart}]`);
          const words = JSON.parse(`[${wordsPart}]`).map((word: any) => ({
            word: word.word || '',
            type: word.type || 'Unknown',
            meaning: word.meaning || ''
          }));
          
          return { en, zh, words };
        }
        
        throw parseError;
      }
    } catch (error) {
      console.error('Failed to parse answer content:', error);
      console.error('Original content:', answerMessage.content);
      throw new Error('Invalid answer content format');
    }
  } catch (error) {
    console.error('Get messages error:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  console.log('=== Translation API Request Started ===');
  
  try {
    const { text } = await request.json();
    console.log('Input text:', text);

    if (!text) {
      console.log('Error: Empty text input');
      return NextResponse.json(
        { success: false, message: '请输入要翻译的文本' },
        { status: 400 }
      );
    }

    // 1. 发起对话
    const requestBody = {
      bot_id: process.env.NEXT_PUBLIC_COZE_BOT_ID,
      user_id: "user_" + Date.now(),
      stream: false,
      auto_save_history: true,
      additional_messages: [
        {
          role: "user",
          content: text,
          content_type: "text"
        }
      ]
    };
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    console.log('Sending request to Coze API...');
    const response = await fetch('https://api.coze.cn/v3/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.COZE_API_TOKEN}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response received');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error Response Body:', errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText.slice(0, 200)}`);
    }

    const chatResponse = await response.json();
    console.log('Chat API Response:', JSON.stringify(chatResponse, null, 2));

    // 检查 API 响应结构
    console.log('Checking response structure...');
    console.log('conversation_id:', chatResponse.data?.conversation_id);
    console.log('chat_id:', chatResponse.data?.id);

    // 从 data 字段中获取 ID
    const conversationId = chatResponse.data?.conversation_id;
    const chatId = chatResponse.data?.id;

    // 如果没有返回预期的字段，直接返回模拟数据
    if (!conversationId || !chatId) {
      console.log('Missing conversation_id or chat_id, returning mock data');
      return NextResponse.json({
        success: true,
        data: {
          en: [text],
          zh: ["正在等待翻译..."],
          words: []
        }
      });
    }

    // 2. 轮询对话状态
    console.log('Polling chat status...');
    console.log('Using conversation_id:', conversationId);
    console.log('Using chat_id:', chatId);
    
    await pollChatStatus(
      conversationId,
      chatId,
      process.env.COZE_API_TOKEN as string
    );

    // 3. 获取对话详情
    console.log('Getting chat messages...');
    const messages = await getChatMessages(
      conversationId,
      chatId,
      process.env.COZE_API_TOKEN as string
    );

    // 4. 处理返回结果
    const result = {
      success: true,
      data: {
        en: messages.en || [text],
        zh: messages.zh || ["翻译失败"],
        words: messages.words || []
      }
    };
    console.log('Final Response:', JSON.stringify(result, null, 2));

    console.log('=== Translation API Request Completed Successfully ===');
    return NextResponse.json(result);

  } catch (error) {
    console.error('=== Translation API Request Failed ===');
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : '翻译失败，请稍后重试',
        debug: process.env.NODE_ENV === 'development' ? {
          botId: process.env.NEXT_PUBLIC_COZE_BOT_ID,
          hasToken: !!process.env.COZE_API_TOKEN,
          timestamp: new Date().toISOString()
        } : undefined
      },
      { status: 500 }
    );
  }
} 