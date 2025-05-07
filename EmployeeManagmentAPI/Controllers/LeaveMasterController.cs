using EmployeeManagmentAPI.DTOs;
using EmployeeManagmentAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeManagmentAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize] // Require JWT token for access

    public class LeaveMasterController : ControllerBase
    {
        private readonly ILeaveMasterService _leaveMasterService;

        public LeaveMasterController(ILeaveMasterService leaveMasterService)
        {
            _leaveMasterService = leaveMasterService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _leaveMasterService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _leaveMasterService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        //[Authorize(Roles = "Admin")] // Optional: Only Admins can create
        public async Task<IActionResult> Create([FromBody] LeaveMasterUpsertDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var created = await _leaveMasterService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        //[Authorize(Roles = "Admin")] // Optional: Only Admins can update
        public async Task<IActionResult> Update(int id, [FromBody] LeaveMasterUpsertDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var updated = await _leaveMasterService.UpdateAsync(id, dto);
            if (updated == null) return NotFound();

            return Ok(updated);
        }

        [HttpDelete("{id}")]
        //[Authorize(Roles = "Admin")] // Optional: Only Admins can delete
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _leaveMasterService.DeleteAsync(id);
            if (!deleted) return NotFound();

            return NoContent();
        }

    }
}
