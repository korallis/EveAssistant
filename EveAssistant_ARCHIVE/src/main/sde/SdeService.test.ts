import { SdeService } from './SdeService';
import { server } from '../../mocks';
import { BrowserWindow } from 'electron';
import { DatabaseService } from '../db/DatabaseService';

// Mock Electron modules
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn().mockReturnValue('/mock/path')
  },
  BrowserWindow: jest.fn().mockImplementation(() => ({
    webContents: {
      send: jest.fn()
    }
  }))
}));

// Mock fs-extra
jest.mock('fs-extra', () => ({
  ensureDir: jest.fn().mockResolvedValue(undefined),
  createWriteStream: jest.fn().mockReturnValue({
    on: jest.fn().mockImplementation((event, cb) => {
      if (event === 'finish') setTimeout(cb, 10);
      return this;
    }),
    write: jest.fn(),
    end: jest.fn()
  }),
  readFile: jest.fn().mockResolvedValue(Buffer.from('mock-file-content')),
  readJson: jest.fn().mockResolvedValue({ mockData: true }),
  writeJson: jest.fn().mockResolvedValue(undefined),
  pathExists: jest.fn().mockResolvedValue(true),
  remove: jest.fn().mockResolvedValue(undefined)
}));

// Mock AdmZip
jest.mock('adm-zip', () => {
  return jest.fn().mockImplementation(() => ({
    extractAllTo: jest.fn()
  }));
});

// Mock DatabaseService
jest.mock('../db/DatabaseService', () => ({
  DatabaseService: {
    getInstance: jest.fn().mockReturnValue({
      shipRepository: {
        count: jest.fn().mockResolvedValue(0)
      },
      getDataSource: jest.fn().mockReturnValue({
        transaction: jest.fn().mockImplementation((cb) => cb({
          getRepository: jest.fn().mockReturnValue({
            save: jest.fn().mockResolvedValue(undefined)
          })
        }))
      })
    })
  }
}));

// Setup MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});

// Close server after all tests
afterAll(() => {
  server.close();
});

describe('SdeService', () => {
  let sdeService: SdeService;
  let mockMainWindow: BrowserWindow;

  beforeEach(() => {
    mockMainWindow = new BrowserWindow();
    sdeService = new SdeService(mockMainWindow);
  });

  it('should download SDE data', async () => {
    await sdeService.downloadSde();
    
    // Verify progress updates were sent
    expect(mockMainWindow.webContents.send).toHaveBeenCalledWith('sde-progress', expect.objectContaining({ status: 'downloading' }));
    expect(mockMainWindow.webContents.send).toHaveBeenCalledWith('sde-progress', expect.objectContaining({ status: 'verifying' }));
    expect(mockMainWindow.webContents.send).toHaveBeenCalledWith('sde-progress', expect.objectContaining({ status: 'extracting' }));
    expect(mockMainWindow.webContents.send).toHaveBeenCalledWith('sde-progress', expect.objectContaining({ status: 'importing' }));
  });

  it('should skip download if data already exists', async () => {
    // Override the mock to make it look like data already exists
    (DatabaseService.getInstance().shipRepository.count as jest.Mock).mockResolvedValueOnce(100);
    
    await sdeService.downloadSde();
    
    // Verify progress updates were not sent
    expect(mockMainWindow.webContents.send).not.toHaveBeenCalled();
  });
}); 