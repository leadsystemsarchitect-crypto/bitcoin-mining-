export const createSpreadsheet = async (accessToken: string, title: string) => {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create spreadsheet');
  }

  return await response.ok ? response.json() : null;
};

export const updateSheetData = async (
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: any[][]
) => {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values,
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to update sheet data');
  }

  return await response.json();
};
