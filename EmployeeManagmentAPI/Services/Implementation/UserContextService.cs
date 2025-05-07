using EmployeeManagmentAPI.Services.Interfaces;
using System.Security.Claims;

namespace EmployeeManagmentAPI.Services.Implementation
{
    public class UserContextService : IUserContextService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserContextService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public int GetEmployeeId()
        {
            var employeeId = _httpContextAccessor.HttpContext?.User.FindFirst("EmployeeId")?.Value;
            return employeeId != null ? int.Parse(employeeId) : 0;
        }

        public async Task<string> GetUserRoleAsync()
        {
            var role = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.Role)?.Value;
            return role ?? "";
        }
    }
}
