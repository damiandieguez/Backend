const profesionalService = require('../../src/services/profesionalService');
const Profesional = require('../../src/models/profesionalModel');

jest.mock('../../src/models/profesionalModel');

describe('Unit Tests: Servicio de Profesionales (profesionalService)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProfesional()', () => {
    const profData = {
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      matricula: 'MN-45892',
      contacto: { email: 'carlos@hospital.com' },
      especialidades: [{ nombre: 'Cardiología' }]
    };

    test('Debe lanzar error 400 si la matrícula ya se encuentra registrada', async () => {
      Profesional.findOne.mockResolvedValue({ _id: 'prof_existente', matricula: 'MN-45892' });

      await expect(profesionalService.createProfesional(profData)).rejects.toMatchObject({
        message: expect.stringContaining('Ya existe un profesional registrado con la matrícula'),
        statusCode: 400
      });

      expect(Profesional.findOne).toHaveBeenCalledWith({ matricula: 'MN-45892' });
    });

    test('Debe crear exitosamente el profesional si la matrícula es única', async () => {
      Profesional.findOne.mockResolvedValue(null);

      const mockSaved = {
        _id: 'prof_nuevo_123',
        ...profData
      };
      mockSaved.save = jest.fn().mockResolvedValue(mockSaved);

      Profesional.mockImplementation(() => mockSaved);

      const resultado = await profesionalService.createProfesional(profData);

      expect(mockSaved.save).toHaveBeenCalled();
      expect(resultado._id).toBe('prof_nuevo_123');
      expect(resultado.matricula).toBe('MN-45892');
    });
  });

  describe('getProfesionalById()', () => {
    test('Debe lanzar error 404 si el profesional no existe', async () => {
      Profesional.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await expect(profesionalService.getProfesionalById('id_no_valido')).rejects.toMatchObject({
        message: 'Profesional no encontrado',
        statusCode: 404
      });
    });

    test('Debe retornar los datos del profesional si existe', async () => {
      const mockProf = { _id: 'prof_1', nombre: 'Laura', especialidades: [{ nombre: 'Dermatología' }] };

      Profesional.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProf)
      });

      const res = await profesionalService.getProfesionalById('prof_1');
      expect(res).toEqual(mockProf);
    });
  });

  describe('deleteProfesional()', () => {
    test('Debe lanzar error 404 si el profesional a eliminar no existe', async () => {
      Profesional.findByIdAndDelete.mockResolvedValue(null);

      await expect(profesionalService.deleteProfesional('inexistente')).rejects.toMatchObject({
        message: 'Profesional no encontrado',
        statusCode: 404
      });
    });

    test('Debe eliminar el profesional si existe', async () => {
      const mockDeleted = { _id: 'prof_1', matricula: 'MN-1111' };
      Profesional.findByIdAndDelete.mockResolvedValue(mockDeleted);

      const res = await profesionalService.deleteProfesional('prof_1');
      expect(res).toEqual(mockDeleted);
    });
  });
});
