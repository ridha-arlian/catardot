// import { google } from 'googleapis'

// export async function resizeStoryColumn(accessToken: string, spreadsheetId: string, sheetId: number) {
//   const auth = new google.auth.OAuth2()
//   auth.setCredentials({ access_token: accessToken })
//   const sheets = google.sheets({ version: 'v4', auth })

//   try {
//     await sheets.spreadsheets.batchUpdate({
//       spreadsheetId,
//       requestBody: {
//         requests: [{
//           autoResizeDimensions: {
//             dimensions: {
//               sheetId,
//               dimension: 'COLUMNS',
//               startIndex: 1,
//               endIndex: 2,
//             }
//           }
//         }]
//       }
//     })
    
//   } catch (err) {
//     console.error('Error resizing Story column: ', err)
//   }
// }
