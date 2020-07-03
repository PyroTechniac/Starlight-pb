import { client } from '@mocks/MockInstances';

afterAll((): Promise<void> => client.destroy());
