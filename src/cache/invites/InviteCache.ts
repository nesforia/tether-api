import {IInvite} from "../../types/interface/IInvite";

const cache = new Map<string, IInvite>();
const timeouts = new Map<string, NodeJS.Timeout>();

function keyFor(invite: IInvite): string {
    return `${invite.from}:${invite.to}:${invite.groupId ?? "-"}`;
}

function altKeyFor(to: string, groupId?: string): string {
    return `${to}:${groupId ?? "-"}`;
}

export default {
    cache,

    set(invite: IInvite): IInvite {
        const key = keyFor(invite);
        if (cache.has(key)) return cache.get(key)!;

        cache.set(key, invite);

        const timeout = setTimeout(() => this.remove(invite), 30 * 1000);
        timeouts.set(key, timeout);

        return invite;
    },

    get(from: string, to: string, groupId?: string): IInvite | undefined {
        return cache.get(keyFor({ from, to, groupId }));
    },

    // Lookup without knowing who sent the invite — for routes where the
    // client only has (their own id, the group id), like acceptInvite.
    getByRecipient(to: string, groupId?: string): IInvite | undefined {
        const altKey = altKeyFor(to, groupId);

        for (const invite of cache.values()) {
            if (altKeyFor(invite.to, invite.groupId) === altKey) {
                return invite;
            }
        }

        return undefined;
    },

    remove(invite: IInvite) {
        const key = keyFor(invite);
        cache.delete(key);

        const timeout = timeouts.get(key);
        if (timeout) {
            clearTimeout(timeout);
            timeouts.delete(key);
        }
    },
};