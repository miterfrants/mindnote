using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using System;
using System.Net;
using Newtonsoft.Json;

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
        catch (MindMapException ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, MindMapException ex)
    {
        var code = HttpStatusCode.InternalServerError;
        if (ex.code != HttpStatusCode.OK)
        {
            code = ex.code;
        }
        var result = JsonConvert.SerializeObject(new { error = ex.Message });
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)code.GetHashCode();
        return context.Response.WriteAsync(result);
    }
}