using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using System;
using System.Net;
using Mindmap.Util;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate next;
    public ErrorHandlingMiddleware(RequestDelegate next)
    {
        this.next = next;
    }

    public async Task Invoke(HttpContext context /* other dependencies */)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        var code = HttpStatusCode.InternalServerError;
        if (ex.GetType() == typeof(MindMapException))
        {
            var mindMapEx = (MindMapException)ex;
            if (mindMapEx.code != HttpStatusCode.OK)
            {
                code = mindMapEx.code;
            }
        }

        var result = new JSONResponse(JSONResponseStatus.FAILED, new { message = ex.Message });

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)code.GetHashCode();
        return context.Response.WriteAsync(result.toString());
    }
}