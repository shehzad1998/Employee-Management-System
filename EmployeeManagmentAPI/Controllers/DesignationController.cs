using EmployeeManagmentAPI.DTOs;
using EmployeeManagmentAPI.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeManagmentAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DesignationController : ControllerBase
    {
        private readonly IGenericService<DesignationDtO> _service;

        public DesignationController(IGenericService<DesignationDtO> service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var designations = await _service.GetAllAsync();
            return Ok(designations);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var designation = await _service.GetByIdAsync(id);
            if (designation == null) return NotFound();
            return Ok(designation);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] DesignationDtO dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] DesignationDtO dto)
        {
            var updated = await _service.UpdateAsync(id, dto);
            if (!updated) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
