namespace EmployeeManagmentAPI.Services.Interfaces
{
    public interface IUserContextService
    {
        int GetEmployeeId();
        Task<string> GetUserRoleAsync();
    }
}
