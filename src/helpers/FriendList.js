export class Render {
    constructor(container, renderFunction) {
        this.container = container;
        this.renderFunction = renderFunction;
    }

    render(context) {
        this.container.innerHTML = this.renderFunction(context);
    }
}

export default class FriendList extends Render {
    constructor (container, renderFunction) {
        super(container, renderFunction);
        this._friends = [];
        this.filter = '';
    }

    setFriends(friends) {
        this._friends = friends;
        this.render();
    }

    findFriend(niddle) {
        this.filter = niddle.toLowerCase();
        this.render();
    }

    get friends() {
        if (this.filter) {
            const regExp = new RegExp(`${this.filter}`, 'i');

            return this._friends.filter(f => {
                return regExp.test(f.first_name) ||regExp.test(f.last_name);
            })
        }

        return this._friends;
    }

    render() {
        super.render({friends: this.friends});
    }
}