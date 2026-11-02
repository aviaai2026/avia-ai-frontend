import type { EmployeeConfiguration } from
  '@/components/ai-employees/ai-employee-configuration-dialog'

type EmployeeId = 'lead-employee' | 'lead-revival-employee'

type EmployeeConfigurationResponse = {
  employee_id: EmployeeId
  configuration: EmployeeConfiguration | null
  updated_at: string | null
}

// Sends a request and returns a useful error when the API rejects it.
async function requestConfiguration(
  employeeId: EmployeeId,
  method: 'GET' | 'PUT',
  configuration?: EmployeeConfiguration,
): Promise<EmployeeConfigurationResponse> {
  const response = await fetch(
    `/api/ai-employees/${employeeId}/configuration`,
    {
      method,
      headers: {
        ...(configuration ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(configuration
        ? { body: JSON.stringify(configuration) }
        : {}),
      cache: 'no-store',
    },
  )

  if (!response.ok) {
    let message = `Configuration request failed (${response.status}).`

    try {
      const errorBody = await response.json()
      if (typeof errorBody.detail === 'string') {
        message = errorBody.detail
      }
    } catch {
      // Keep the fallback message if the response is not JSON.
    }

    throw new Error(message)
  }

  return response.json() as Promise<EmployeeConfigurationResponse>
}

// Loads one employee's configuration from the backend.
export function getEmployeeConfiguration(employeeId: EmployeeId) {
  return requestConfiguration(employeeId, 'GET')
}

// Persists one employee's configuration and returns the server response.
export function saveEmployeeConfiguration(
  employeeId: EmployeeId,
  configuration: EmployeeConfiguration,
) {
  return requestConfiguration(employeeId, 'PUT', configuration)
}