```typescript
import axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from "axios";
import Router from "next/router";
import {APIErrorResponse} from "../dto/api/api-error-response";
import {APIResponse} from "../dto/api/api-response";

// Taken from https://github.com/arielweinberger/task-management-frontend/blob/master/src/services/base-http.service.js

export default class BaseHttpService {
    BASE_URL = process.env.BASE_URL || "http://localhost:3000";

    //   _accessToken: string = null;

    async get<T = any>(
        endpoint: string,
        options: AxiosRequestConfig = {}
    ): Promise<T | void> {
        Object.assign(options, this._getCommonOptions());
        return axios
            .get<APIResponse<T>>(`${this.BASE_URL}${endpoint}`, options)
            .then((res: AxiosResponse<APIResponse<T>>) => res.data.data)
            .catch((error: AxiosError<APIErrorResponse>) =>
                this._handleHttpError(error)
            );
    }

    async post<T = any>(
        endpoint: string,
        data: any = {},
        options: AxiosRequestConfig = {}
    ): Promise<T | void> {
        Object.assign(options, this._getCommonOptions());
        return axios
            .post<APIResponse<T>>(`${this.BASE_URL}${endpoint}`, data, options)
            .then((res: AxiosResponse<APIResponse<T>>) => res.data.data)
            .catch((error: AxiosError<APIErrorResponse>) =>
                this._handleHttpError(error)
            );
    }

    async delete<T = any>(
        endpoint: string,
        options: AxiosRequestConfig = {}
    ): Promise<T | void> {
        Object.assign(options, this._getCommonOptions());
        return axios
            .delete<APIResponse<T>>(`${this.BASE_URL}${endpoint}`, options)
            .then((res: AxiosResponse<APIResponse<T>>) => res.data.data)
            .catch((error: AxiosError<APIErrorResponse>) =>
                this._handleHttpError(error)
            );
    }

    async patch<T = any>(
        endpoint: string,
        data: any = {},
        options: AxiosRequestConfig = {}
    ): Promise<T | void> {
        Object.assign(options, this._getCommonOptions());
        return axios
            .patch<APIResponse<T>>(`${this.BASE_URL}${endpoint}`, data, options)
            .then((res: AxiosResponse<APIResponse<T>>) => res.data.data)
            .catch((error: AxiosError<APIErrorResponse>) =>
                this._handleHttpError(error)
            );
    }

    _handleHttpError(error: AxiosError<APIErrorResponse>) {
        if (error?.response?.data) {
            const {statusCode} = error?.response?.data;

            const requestUrl = error.response?.config.url;

            if (
                statusCode !== 401 ||
                requestUrl?.endsWith("/api/auth/login") ||
                requestUrl?.endsWith("/api/auth/register")
            ) {
                throw error.response.data;
            } else {
                return this._handle401(error);
            }
        } else {
            throw error;
        }
    }

    _handle401(error: AxiosError<APIErrorResponse>) {
        this.get("/api/auth/refresh")
            .then(() => axios.request(error.config))
            .catch((e) => Router.push("/login"));
    }

    _getCommonOptions() {
        const token = this.loadToken();

        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        return {};
    }

    get accessToken() {
        return this._accessToken ? this._accessToken : this.loadToken();
    }

    saveToken(accessToken: string) {
        this._accessToken = accessToken;
        return localStorage.setItem("accessToken", accessToken);
    }

    loadToken() {
        const token: string = localStorage.getItem("accessToken") as string;
        this._accessToken = token;
        return token;
    }

    removeToken() {
        localStorage.removeItem("accessToken");
    }
}
```

*Usage*

```typescript
export default class TasksService extends BaseHttpService {
    fetchTasks({status, search}) {
        const queryObj = {};

        if (status.length) {
            queryObj.status = status;
        }

        if (search.length) {
            queryObj.search = search;
        }

        const queryStr = queryString.stringify(queryObj);
        return this.get('tasks' + (queryStr ? `?${queryStr}` : ''));
    }

    async deleteTask(id) {
        await this.delete(`tasks/${id}`);
    }

    updateTaskStatus(id, status) {
        return this.patch(`tasks/${id}/status`, {status});
    }

    createTask(title, description) {
        return this.post(`tasks`, {title, description});
    }
}
```

````typescript
export default class AuthService extends BaseHttpService {
    async login(loginDto: LoginDto): Promise<SessionUserDto> {
        return (await this.post<SessionUserDto>(
            "/api/auth/login",
            loginDto
        )) as SessionUserDto;
    }

    async register(registerDto: RegisterDto): Promise<void> {
        return await this.post("/api/auth/register", registerDto);
    }
}
````

```typescript
export default class UserStore {
    user: SessionUserDto | null;

    constructor(
        private readonly rootStore: RootStore,
        private readonly authService: AuthService
    ) {
        this.user = null;
        makeAutoObservable(this);
    }

    async login(loginDto: LoginDto): Promise<void> {
        this.user = await this.authService.login(loginDto);
    }

    async register(registerDto: RegisterDto): Promise<void> {
        await this.authService.register(registerDto);
        const {email, password} = registerDto;
        const loginDto: LoginDto = {email, password};
        this.user = await this.authService.login(loginDto);
    }
}
```