import {IPlayerState} from "../../types/interface/IPlayerState";

const cache = new Map<string, IPlayerState>();

export default {
    cache,
    set (state: IPlayerState): IPlayerState {
       if(this.cache.get(state.id)) return state;
       else {
           this.cache.set(state.id, state);
           return state;
       }
    },
    get (id: string): IPlayerState | undefined {
        return this.cache.get(id);
    },
    remove(id: string) {
        this.cache.delete(id);
    }
}