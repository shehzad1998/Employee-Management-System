using EmployeeManagmentAPI.DTOs;

namespace EmployeeManagmentAPI.Services.Interfaces
{
    public interface IEmployeeService
    {
        Task<IEnumerable<EmployeesDTO>> GetAllEmployeesAsync();

        Task<EmployeesDTO> GetEmployeeByIdAsync(int id);
        Task<EmployeesDTO> AddEmployeeAsync(EmployeeCreateUpdateDTO employeeDto);
        Task<EmployeesDTO?> UpdateEmployeeAsync(int id, EmployeeCreateUpdateDTO employeeDto);
        Task<bool> DeleteEmployeeAsync(int id);

    }
}
