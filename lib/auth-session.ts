import {AuthRequestError} from './auth-request';

export type SessionRestoreResult<User> =
  | {state:'authenticated';user:User}
  | {state:'expired'}
  | {state:'unavailable';message:string};

// Only an explicit unauthorized response proves that a stored session expired.
// Service failures must leave the token available for a later retry.
export async function restoreSession<User>(
  readUser:()=>Promise<{user:User}>,
  clearExpiredToken:()=>void,
):Promise<SessionRestoreResult<User>>{
  try{
    const {user}=await readUser();
    return {state:'authenticated',user};
  }catch(error){
    if(error instanceof AuthRequestError&&error.status===401){
      clearExpiredToken();
      return {state:'expired'};
    }
    return {state:'unavailable',message:'ログイン状態を確認できませんでした。通信状況を確認して、もう一度お試しください。'};
  }
}
