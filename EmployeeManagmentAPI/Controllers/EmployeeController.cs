using EmployeeManagmentAPI.DTOs;
using EmployeeManagmentAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeManagmentAPI.Controllers
{   
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;

        public EmployeeController(IEmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        // GET: api/Employee
        [HttpGet]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetAll()
        {
            var employees = await _employeeService.GetAllEmployeesAsync();
            return Ok(employees);
        }

        // GET: api/Employee/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            // Get the current user's employee ID from claims
            var currentEmployeeId = int.Parse(User.FindFirst("EmployeeId")?.Value ?? "0");
            
            // If user is not Admin/Manager and trying to access someone else's data, deny access
            if (!User.IsInRole("Admin") && !User.IsInRole("Manager") && currentEmployeeId != id)
            {
                return Forbid();
            }

            var employee = await _employeeService.GetEmployeeByIdAsync(id);
            if (employee == null)
                return NotFound();

            return Ok(employee);
        }

        // POST: api/Employee
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] EmployeeCreateUpdateDTO employeeDto)
        {
            var createdEmployee = await _employeeService.AddEmployeeAsync(employeeDto);
            return CreatedAtAction(nameof(GetById), new { id = createdEmployee.Id }, createdEmployee);
        }

        // PUT: api/Employee/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] EmployeeCreateUpdateDTO employeeDto)
        {
            var updatedEmployee = await _employeeService.UpdateEmployeeAsync(id, employeeDto);
            if (updatedEmployee == null)
                return NotFound();

            return Ok(updatedEmployee);
        }

        // DELETE: api/Employee/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _employeeService.DeleteEmployeeAsync(id);
            if (!deleted)
                return NotFound();

            return NoContent();
        }
    }
}
