using Newtonsoft.Json;
using System;
namespace Mindnote.Util
{
    public class JSONResponse
    {
        public JSONResponse(JSONResponseStatus status, dynamic data)
        {
            this.status = status;
            this.data = data;
        }
        public string toString()
        {
            return JsonConvert.SerializeObject(
                new
                {
                    status = Enum.GetName(typeof(JSONResponseStatus), this.status),
                    data = this.data
                }
            );
        }

        public dynamic toResponseObj()
        {
            return new
            {
                status = Enum.GetName(typeof(JSONResponseStatus), this.status),
                data = this.data
            };
        }
        public JSONResponseStatus status = JSONResponseStatus.OK;
        public dynamic data = null;
    }

    public enum JSONResponseStatus
    {
        OK,
        FAILED
    }
}

