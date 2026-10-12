import {useQuery} from "@tanstack/react-query";
import {IPagination} from "@/types/IPagination";
import {UserService} from "@/services/user/user/user.service";
import {IUsersQuery} from "@/screens/users/types/user/IUsersQuery";
import {useUsersFilterStore} from "@/store/user/user-store/useUsersFilter";

export const useUsersQuery = () => {
    const useFilteredUsers = () => {
        const {page, limit, sortBy, sortOrder} = useUsersFilterStore();
        return {page, limit: Number(limit), sortBy, sortOrder}
    };
    const filterParams = useFilteredUsers()
    return useQuery({
        queryKey: ['all-user', filterParams],
        queryFn: () => UserService.getUsers(filterParams)
            .then(data =>
                data.data.data as { meta: IPagination,  users: Array<IUsersQuery> })
    })
}