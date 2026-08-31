import {IGroup} from "../../types/interface/IGroup";

const cache = new Map<string, IGroup>()

export default {
    cache,
    set (state: IGroup): IGroup {
        if(this.cache.get(state.id)) return state;
        else {
            this.cache.set(state.id, state);
            return state;
        }
    },
    get (id: string): IGroup | undefined {
        return this.cache.get(id);
    },
    removeParticipant(group: string, participant: string) {
        if (this.cache.get(group)) {
            this.cache.get(group)!.participants = this.cache.get(group)!.participants.filter(p => p !== participant)
        }
    },
    remove(id: string) {
        this.cache.delete(id);
    }
}