using EmployeeManagmentAPI.DTOs;
using EmployeeManagmentAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace EmployeeManagmentAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeaveController : ControllerBase
    {
        private readonly ILeaveService _leaveService;

        public LeaveController(ILeaveService leaveService)
        {
            _leaveService = leaveService;
        }

        // GET: api/Leave
        [HttpGet]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetAllLeaves()
        {
            var leaves = await _leaveService.GetAllAsync();
            return Ok(leaves);
        }

        // For Apply and reject logic:
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetLeaveByIdAsync(int id)
        {
            var leave = await _leaveService.GetLeaveByIdAsync(id);
            if (leave == null) return NotFound();
            return Ok(leave);
        }

        // GET: api/Leave/5
        [HttpGet("Employee/{employeeId}")]
        [Authorize(Roles = "Admin,Manager,Employee")]
        public async Task<IActionResult> GetLeavesByEmployeeId(int employeeId)
        {
            Console.WriteLine($"Getting leaves for employee ID: {employeeId}");
            var leaves = await _leaveService.GetByIdAsync(employeeId);
            Console.WriteLine($"Found {leaves.Count()} leaves for employee {employeeId}");
            return Ok(leaves);
        }

        // POST: api/Leave/apply
        [HttpPost("apply")]
        [Authorize(Roles = "Employee,Manager")]
        public async Task<IActionResult> ApplyLeave([FromBody] LeaveApplyDTO dto)
        {
            var result = await _leaveService.ApplyLeaveAsync(dto);
            return Created($"/api/Leave/{result.Id}", result);
        }

        // PUT: api/Leave/approve/5
        [HttpPut("approve/{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> ApproveLeave(int id)
        {
            try
            {
                var result = await _leaveService.ApproveLeaveAsync(id);
                return Ok("Leave Approved");
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message); // Returns 403 Forbidden
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("already approved"))
            {
                return Conflict(ex.Message); // Returns 409 Conflict
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message); // Returns 404 Not Found
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message); // Returns 400 Bad Request
            }
        }

        // PUT: api/Leave/reject/5
        [HttpPut("reject/{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> RejectLeave(int id)
        {
            var result = await _leaveService.RejectLeaveAsync(id);
            if (!result)
                return Unauthorized("You are not authorized to reject this leave.");

            return Ok("Leave Rejected");
        }

        // DELETE: api/Leave/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager,Employee")]
        public async Task<IActionResult> DeleteLeave(int id)
        {
            var deleted = await _leaveService.DeleteAsync(id);
            if (!deleted) return NotFound();

            return Ok("Leave Deleted");
        }
    }
}
