export function publicUser(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
  avatarUrl: string | null;
  notificationsOn: boolean;
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerified,
    avatarUrl: user.avatarUrl,
    notificationsOn: user.notificationsOn,
    createdAt: user.createdAt,
  };
}