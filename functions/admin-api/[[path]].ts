/**
 * Cloudflare Pages Functions - API 反向代理
 *
 * 用途：将前端的 /admin-api/* 请求转发到后端服务
 *
 * 路径：caicai-admin-front/functions/admin-api/[[path]].ts
 *
 * 这样所有访问 https://你的域名.pages.dev/admin-api/* 的请求
 * 都会被转发到你的后端服务
 */

interface Env {
  BACKEND_URL?: string;
  BACKEND_HOST?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // 后端服务地址配置
  // 优先使用环境变量，否则使用默认值
  const backendUrl = env.BACKEND_URL || 'https://backend.caicai.cloud';
  const backendHost = env.BACKEND_HOST || 'backend.caicai.cloud';

  // 提取路径（去掉 /admin-api 前缀）
  const pathMatch = url.pathname.match(/^\/admin-api(.*)$/);
  const path = pathMatch ? pathMatch[1] : '';

  // 构建完整的后端请求 URL
  const targetUrl = `${backendUrl}${path}${url.search}`;

  try {
    // 准备请求体
    let body = undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      body = await request.text();
    }

    // 构建转发请求的头部
    const headers = new Headers(request.headers);
    // 修改 Host 头，使后端能正确识别请求
    headers.set('Host', backendHost);
    // 添加 X-Forwarded 头，帮助后端识别原始请求信息
    headers.set('X-Forwarded-For', request.headers.get('cf-connecting-ip') || '');
    headers.set('X-Forwarded-Proto', 'https');
    headers.set('X-Forwarded-Host', url.hostname);

    // 转发请求到后端
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: body,
      // 设置超时时间（30秒）
      cf: {
        cacheTtl: 0, // 不缓存 API 响应
      },
    });

    // 构建返回响应
    const responseHeaders = new Headers(response.headers);

    // 添加 CORS 头（如果前端是跨域访问）
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('API proxy error:', error);

    return new Response(
      JSON.stringify({
        code: 500,
        message: 'API 请求失败',
        error: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
};

// 处理 OPTIONS 请求（CORS 预检）
export const onRequestOptions: PagesFunction = (context) => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
};
