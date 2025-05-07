namespace EmployeeManagmentAPI.Services.Interfaces
{
    public interface IGenericService<TDto>
    {
        Task<IEnumerable<TDto>> GetAllAsync();
        Task<TDto?> GetByIdAsync(int id);
        Task<TDto> CreateAsync(TDto dto);
        Task<bool> UpdateAsync(int id, TDto dto);
        Task<bool> DeleteAsync(int id);

    }
}
