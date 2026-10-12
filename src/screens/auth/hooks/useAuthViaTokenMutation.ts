import {useMutation} from "@tanstack/react-query";
import {AuthService} from "@/services/auth/auth.service";
import {ILogin, ITokenForm} from "../types/ITokenForm";
import {useAuthStore} from "@/store/auth/authReducer";

export const useAuthViaTokenMutation = () => {
	const {setTokens, clearTokens, clearStorage} = useAuthStore()
	return useMutation({
		mutationKey: ["login"],
		mutationFn: (token: ITokenForm) =>
			AuthService.checkToken(token).then(
				(data) => data.data.data as ILogin
			),
		onSuccess: (data) => {
			// Ім'я і пошта вже приходять у відповіді — раніше вони просто губились
			setTokens(data.accessToken, data.refreshToken, {
				role: data.user.roles.name,
				name: data.user.name,
				email: data.user.email,
			});
		},
		onError: () => {
			clearTokens();
			clearStorage();
		}
	});
}