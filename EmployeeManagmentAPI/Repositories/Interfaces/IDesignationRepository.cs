using EmployeeManagmentAPI.Models;

namespace EmployeeManagmentAPI.Repositories.Interfaces
{
    public interface IDesignationRepository
    {
        Task<IEnumerable<Designation>> GetAllDesignationsAsync();
        Task<Designation?> GetDesignationByIdAsync(int id);
        Task<Designation> AddDesignationAsync(Designation designation);
        Task<Designation?> UpdateDesignationAsync(Designation designation);
        Task<bool> DeleteDesignationAsync(int id);
    }
}
