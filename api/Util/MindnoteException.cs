using System.Net;
using System;
public class MindnoteException : Exception
{
    public HttpStatusCode code;
    public MindnoteException(string message, HttpStatusCode code = HttpStatusCode.OK)
        : base(message)
    {
        this.code = code;
    }
}