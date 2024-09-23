import prisma from "../lib/prisma/client";

// 全てのユーザーデータを取得する関数
export const getAllUsers = async (limit = 0) => {
  if (limit > 0) {
    return await prisma.user.findMany({
      take: limit,
      include: {
        gameResults: true,
      },
      orderBy: {
        createdAt: "desc", // ユーザーが作成された日時でソート
      },
    });
  }
  return await prisma.user.findMany({
    include: {
      gameResults: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// IDで特定のユーザーを取得する関数
export const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
    include: {
      gameResults: true,
      userBooks: {
        include: {
          book: true,
        },
      },
    },
  });
  return user;
};

// 特定のユーザーIDに関連する本を取得する関数
export const getUserBooksByUserId = async (userId: number) => {
  return await prisma.userBook.findMany({
    where: {
      userId: userId,
    },
    include: {
      book: true,
    },
  });
};

// 特定の本IDリストに関連するユーザーブックを取得する関数
export const getUserBooksByBookIds = async (bookIdList: number[]) => {
  return await prisma.userBook.findMany({
    where: {
      bookId: {
        in: bookIdList,
      },
    },
    include: {
      book: true,
    },
  });
};
