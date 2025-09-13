/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/prisma'

export const userService = {
  async createUser(userData: { id?: string, name?: string | null, email?: string | null, emailVerified?: Date | null, image?: string | null, role?: string, spreadsheetId?: string | null }) {
    const { spreadsheetId, ...otherData } = userData
    
    if (spreadsheetId) {
      await prisma.$executeRaw`
        INSERT INTO users (
          id, 
          name, 
          email, 
          email_verified,
          image,
          role,
          spreadsheet_id
        )
        VALUES (
          ${otherData.id || ''},
          ${otherData.name},
          ${otherData.email},
          ${otherData.emailVerified || null},
          ${otherData.image},
          ${otherData.role || 'authenticated'},
          encrypt_spreadsheet_id(${spreadsheetId})
        )
      `
      return await this.getUserById(otherData.id!)
    } else {
      return await prisma.user.create({ data: { ...otherData, role: otherData.role || 'authenticated' } })
    }
  },

  async updateSpreadsheetId(userId: string, spreadsheetId: string | null) {
    if (spreadsheetId) {
      await prisma.$executeRaw`
        UPDATE users 
        SET spreadsheet_id = encrypt_spreadsheet_id(${spreadsheetId})
        WHERE id = ${userId}
      `
    } else {
      await prisma.$executeRaw`
        UPDATE users 
        SET spreadsheet_id = NULL
        WHERE id = ${userId}
      `
    }
    
    return await this.getUserById(userId);
  },

  async updateUser(userId: string, updateData: { name?: string | null, email?: string | null, emailVerified?: Date | null, image?: string | null, role?: string }) {
    return await prisma.user.update({ where: { id: userId }, data: updateData })
  },

  async getUserById(userId: string) {
    const result = await prisma.$queryRaw`
      SELECT 
        id,
        name,
        email,
        email_verified,
        image,
        role,
        decrypt_spreadsheet_id(spreadsheet_id) as spreadsheet_id
      FROM users 
      WHERE id = ${userId}
    ` as any[];

    return result[0] || null
  },

  async getUserByIdEncrypted(userId: string) {
    return await prisma.user.findUnique({ where: { id: userId } })
  },

  async getUserByEmail(email: string) {
    const result = await prisma.$queryRaw`
      SELECT 
        id,
        name,
        email,
        email_verified,
        image,
        role,
        decrypt_spreadsheet_id(spreadsheet_id) as spreadsheet_id
      FROM users 
      WHERE email = ${email}
    ` as any[]

    return result[0] || null
  },

  async getUsersByIds(userIds: string[]) {
    if (userIds.length === 0) return []
    
    return await prisma.$queryRaw`
      SELECT 
        id,
        name,
        email,
        email_verified,
        image,
        role,
        decrypt_spreadsheet_id(spreadsheet_id) as spreadsheet_id
      FROM users 
      WHERE id = ANY(${userIds})
      ORDER BY name
    ` as any[]
  },

  async searchUsers(searchTerm: string, limit: number = 10) {
    return await prisma.$queryRaw`
      SELECT 
        id,
        name,
        email,
        email_verified,
        image,
        role,
        decrypt_spreadsheet_id(spreadsheet_id) as spreadsheet_id
      FROM users 
      WHERE 
        name ILIKE ${`%${searchTerm}%`} OR 
        email ILIKE ${`%${searchTerm}%`}
      ORDER BY name
      LIMIT ${limit}
    ` as any[]
  },

  async deleteUser(userId: string) {
    return await prisma.user.delete({ where: { id: userId } })
  },

  async isSpreadsheetIdInUse(spreadsheetId: string, excludeUserId?: string) {
    const result = await prisma.$queryRaw`
      SELECT id
      FROM users 
      WHERE 
        decrypt_spreadsheet_id(spreadsheet_id) = ${spreadsheetId}
        ${excludeUserId ? prisma.$queryRaw`AND id != ${excludeUserId}` : prisma.$queryRaw``}
      LIMIT 1
    ` as any[]

    return result.length > 0;
  },

  async getAllUsers(page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;
    
    const users = await prisma.$queryRaw`
      SELECT 
        id,
        name,
        email,
        email_verified,
        image,
        role,
        decrypt_spreadsheet_id(spreadsheet_id) as spreadsheet_id
      FROM users 
      ORDER BY name
      LIMIT ${limit}
      OFFSET ${offset}
    ` as any[];

    const totalCount = await prisma.user.count();

    return {
      users,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    }
  }
}

export default userService