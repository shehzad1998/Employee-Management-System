using EmployeeManagmentAPI.Models;

namespace EmployeeManagmentAPI.Repositories.Interfaces
{
    public interface IEmployeeRepository : IRepository<Employee>
    {
        new Task<IEnumerable<Employee>> GetAllAsync();
        new Task<Employee?> GetByIdAsync(int id);
        Task AddAsync(Employee employee);
        Task UpdateAsync(Employee employee);
        Task DeleteAsync(Employee employee);
        Task<Department> GetDepartmentByNameAsync(string name);
        Task<Designation> GetDesignationByTitleAsync(string title);
        Task<User> GetUserByUsernameAsync(string username);



    }
}
