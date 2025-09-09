import { google } from 'googleapis'

export async function getOrCreateSpreadsheet(accessToken: string, userEmail: string) {
  try {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })
    
    const drive = google.drive({ version: 'v3', auth })
    const sheets = google.sheets({ version: 'v4', auth })

    const searchResponse = await drive.files.list({
      q: `name='Catardot Journal - ${userEmail}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      fields: 'files(id, name)',
    })

    if (searchResponse.data.files?.length) {
      const spreadsheetId = searchResponse.data.files[0].id!
      try {
        await sheets.spreadsheets.get({ spreadsheetId })
        return spreadsheetId
      } catch (err) {
        console.warn('Spreadsheet found but not accessible, will create new:', err)
      }
    }

    const createResponse = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title: `Catardot Journal - ${userEmail}` },
        sheets: [{
          properties: { title: 'Journal - Homework for Life' },
          data: [{
            rowData: [{
              values: [
                { userEnteredValue: { stringValue: 'Date' } },
                { userEnteredValue: { stringValue: 'Story' } },
              ],
            }],
          }],
        }],
      },
    })

    const spreadsheetId = createResponse.data.spreadsheetId
    const firstSheetId = createResponse.data.sheets?.[0].properties?.sheetId

    if (!spreadsheetId || firstSheetId === undefined) {
      throw new Error('Spreadsheet creation failed')
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          repeatCell: {
            range: {
              sheetId: firstSheetId,
              startRowIndex: 0,
              endRowIndex: 1
            },
            cell: {
              userEnteredFormat: {
                textFormat: { bold: true },
                backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                horizontalAlignment: 'CENTER',
              }
            },
            fields: 'userEnteredFormat(textFormat,backgroundColor,horizontalAlignment)',
          }
        },
        {
          updateSheetProperties: {
            properties: {
              sheetId: firstSheetId,
              gridProperties: { frozenRowCount: 1 }
            },
            fields: 'gridProperties.frozenRowCount',
          }
        },
        {
          updateDimensionProperties: {
            range: {
              sheetId: firstSheetId,
              dimension: 'COLUMNS',
              startIndex: 1,
              endIndex: 2,
            },
            properties: { pixelSize: 400 },
            fields: 'pixelSize',
          },
        },
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: firstSheetId,
              dimension: 'COLUMNS',
              startIndex: 1,
              endIndex: 2,
            }
          }
        }]
      }
    })

    return spreadsheetId
  } catch (error) {
    console.error('Error with spreadsheet: ', error)
    return null
  }
}