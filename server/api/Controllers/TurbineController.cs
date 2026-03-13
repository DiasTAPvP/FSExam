using ex1.dataaccess;
using ex1.api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ex1.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TurbineController : ControllerBase
{
    private readonly WindFarmDbContext _db;

    public TurbineController(WindFarmDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Turbine>>> GetTurbines()
    {
        return await _db.Turbines.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Turbine>> GetTurbine(string id)
    {
        var turbine = await _db.Turbines.FindAsync(id);
        if (turbine == null) return NotFound();
        return turbine;
    }
}