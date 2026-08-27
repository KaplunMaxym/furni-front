export const RoleEnum = {
    ROOT_ADMIN: 'ROOT_ADMIN',
    STRUCTURAL_ENGINEER: 'STRUCTURAL_ENGINEER',
}

export type RoleEnum = typeof RoleEnum[keyof typeof RoleEnum];