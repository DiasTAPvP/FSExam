using StateleSSE.AspNetCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace ex1.api.Controllers;

[Authorize]
[ApiController]
[Route("api/sse")]
public class SseController : ControllerBase
{
    private readonly ISseBackplane _backplane;

    public SseController(ISseBackplane backplane)
    {
        _backplane = backplane;
    }

    [HttpGet]
    public async Task GetStream()
    {
        // Headers managed by CORS middleware and specific SSE requirements
        Response.Headers["X-Accel-Buffering"] = "no";
        Response.Headers["Cache-Control"] = "no-cache";
        Response.Headers["Connection"] = "keep-alive";
        Response.ContentType = "text/event-stream";
        
        await HttpContext.StreamSseAsync(_backplane, new[] { "farm-updates" }, HttpContext.RequestAborted);
    }
}