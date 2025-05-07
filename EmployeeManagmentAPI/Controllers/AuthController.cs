using EmployeeManagmentAPI.DTOs;
using EmployeeManagmentAPI.Helpers;
using EmployeeManagmentAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace EmployeeManagmentAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly EmployeeManagementDBContext _context;
        private readonly JwtTokenHelper _jwtTokenHelper;

        public AuthController(EmployeeManagementDBContext context, JwtTokenHelper jwtTokenHelper)
        {
            _context = context;
            _jwtTokenHelper = jwtTokenHelper;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDto)
        {
            if (string.IsNullOrWhiteSpace(loginDto.Email) || string.IsNullOrWhiteSpace(loginDto.Password))
            {
                return BadRequest("Email and password are required.");
            }

            // Include Employee in the query
            var user = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.Employee) // Add this line to include Employee
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null || !VerifyPassword(loginDto.Password, user.PasswordHash))
            {
                return Unauthorized("Invalid email or password.");
            }

            // Check if user has an associated employee
            if (user.Employee == null)
            {
                return BadRequest("User is not associated with an employee.");
            }

            // Get the actual EmployeeID from the Employee table
            var employeeId = user.Employee.Id;

            var token = _jwtTokenHelper.GenerateToken(
                userId: user.Id,
                email: user.Email,
                role: user.Role?.Name ?? "User",
                employeeId: employeeId // Use the actual EmployeeID
            );

            return Ok(new
            {
                Token = token,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role?.Name,
                EmployeeId = employeeId,
                UserId = user.Id
            });
        }

        private bool VerifyPassword(string inputPassword, string storedHash)
        {
            using var sha = SHA256.Create();
            var inputHash = Convert.ToBase64String(sha.ComputeHash(Encoding.UTF8.GetBytes(inputPassword)));
            return inputHash == storedHash;
        }
    }
}