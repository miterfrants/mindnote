using System.Net;
using System;
public class MindMapException : Exception
{
    public HttpStatusCode code;
    public MindMapException(string message, HttpStatusCode code = HttpStatusCode.OK)
        : base(message)
    {
    }
}