import type { Company, CompanySchema } from '../models/types';

export async function fetchCompany(companyId: string): Promise<Company> {
  // TODO: call VC2 Company Directory
  return {
    id: companyId,
    name: 'Demo Company',
  };
}

export async function fetchSchema(schemaId: string): Promise<CompanySchema> {
  // TODO: call VC1 Schema Registry
  return {
    id: schemaId,
    companyId: 'co_demo',
    title: 'Demo Onboarding',
    fields: [
      {
        id: 'firstName',
        label: 'First Name',
        type: 'string',
        required: true,
        source: 'vault.identity.firstName',
      },
      {
        id: 'lastName',
        label: 'Last Name',
        type: 'string',
        required: true,
        source: 'vault.identity.lastName',
      },
      { id: 'email', label: 'Email', type: 'email', source: 'vault.identity.email' },
    ],
  };
}
