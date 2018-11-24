import API from './helpers/api';
import FriendList from './helpers/FriendList';
import Handlebars from 'handlebars/dist/cjs/handlebars';

const appId = null;

class FriendApp {
    constructor(vkAppID) {
        this.api = new API(vkAppID);
        this.friends = [];

        this.favoriteIdFriendsArray = [];

        this.mainListElement = document.querySelector('.app__main-list');
        this.favoriteListElement = document.querySelector('.app__favorite-list');

        this.init();
    }

    init() {
        this.initHandleBarsTemplates();
        this.createList();

        this.initHandlers();
        this.initDrag();

        this.loadSavedList();

        this.getFriends();
    }

    initHandlers() {
        const mainSearchInput = document.getElementById('main-search'),
            favoriteSearchInput = document.getElementById('favorite-search');

        mainSearchInput.addEventListener('input', e => {
            this.mainList.findFriend(e.target.value);
        });

        favoriteSearchInput.addEventListener('input', e => {
            this.favoriteList.findFriend(e.target.value);
        });

        this.mainListElement.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.tagName === 'BUTTON') {
                const id = +e.target.closest('.friend').dataset.friendId;

                this.addToFavorite(id);
            }
        });

        this.favoriteListElement.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.tagName === 'BUTTON') {
                const id = +e.target.closest('.friend').dataset.friendId;

                this.returnToMain(id);
            }
        });

        document.getElementById('save-button').addEventListener('click', e => {
            e.preventDefault();
            this.save();
        });
    }

    save() {
        if (confirm('сохранить список?')) {
            localStorage.favoriteIdFriendsArray = JSON.stringify(this.favoriteIdFriendsArray);
            alert('Данные сохранены');
        }
    }

    loadSavedList() {
        this.favoriteIdFriendsArray = JSON.parse(localStorage.favoriteIdFriendsArray || '[]');
    }

    /**
     * Возвращает объект со списками друзей
     * @returns {{main: [], favorite: []}}
     */
    getFriendsLists() {
        return { main: this.getMainList(), favorite: this.getFavoriteList() };
    }

    /**
     * Получение списка друзей оставшихся в основном списке
     * @returns {T[]}
     */
    getMainList() {
        return this.friends.filter(f => !this.favoriteIdFriendsArray.includes(f.id));
    }

    /**
     * Получение списка друзей в списке
     * @returns {T[]}
     */
    getFavoriteList() {
        return this.friends.filter(f => this.favoriteIdFriendsArray.includes(f.id));
    }

    initDrag() {
        let currentDrag;

        document.addEventListener('dragstart', e => {

            const element = e.target.closest('.friend');

            if (element) {
                currentDrag = { element, id: +element.dataset.friendId };
                e.dataTransfer.setData('text/html', 'dragstart');
            }
        });

        document.addEventListener('dragover', e => {
            if (currentDrag) {
                e.preventDefault();
            }
        });

        document.addEventListener('drop', e => {
            app.dropFriend(e.target, currentDrag);
            currentDrag = null;
        });
    }

    /**
     * Подготовка шаблонов для рендера списков
     */
    initHandleBarsTemplates() {
        const addButton = '<button class="addToList">+</button>',
            removeButton = '<button class="addToList">&times;</button>';

        this.mainTemplate = Handlebars.compile(`<div class="friendList">
    {{#each friends}}
    <div class="friend" data-friend-id="{{id}}" draggable="true" id="friend-{{id}}">
        <div class="friend__photo">
            <img src="{{photo_50}}" alt="{{first_name}} {{last_name}}">
        </div>
        <div class="friend__name">{{first_name}} {{last_name}}</div>
        <div class="friend__control">${addButton}</div></div>{{/each}}</div>`);
        this.favoriteTemplate = Handlebars.compile(`<div class="friendList">
    {{#each friends}}
    <div class="friend" data-friend-id="{{id}}" draggable="true" id="friend-{{id}}">
        <div class="friend__photo">
            <img src="{{photo_50}}" alt="{{first_name}} {{last_name}}">
        </div>
        <div class="friend__name">{{first_name}} {{last_name}}</div>
        <div class="friend__control">${removeButton}</div>
    </div>
    {{/each}}
</div>`);
    }

    createList() {
        this.mainList = new FriendList(document.querySelector('.app__main-list'), this.mainTemplate);
        this.favoriteList = new FriendList(document.querySelector('.app__favorite-list'), this.favoriteTemplate);
    }

    getFriends() {
        this.api.call('friends.get', { fields: 'photo_50' })
            .then(friends => {
                this.friends = friends.items;
                this.updateList();
            });
    }

    dropFriend(target, dragItem) {
        if (target.closest('.app__main-list')) {
            this.returnToMain(dragItem.id);
        }

        if (target.closest('.app__favorite-list')) {
            this.addToFavorite(dragItem.id);
        }
    }

    addToFavorite(friendId) {
        if (!this.favoriteIdFriendsArray.includes(friendId)) {
            this.favoriteIdFriendsArray.push(friendId);
        }

        this.updateList();
    }

    returnToMain(friendId) {
        if (this.favoriteIdFriendsArray.includes(friendId)) {
            this.favoriteIdFriendsArray.splice(this.favoriteIdFriendsArray.indexOf(friendId), 1);
        }

        this.updateList();
    }

    updateList() {
        const { main, favorite } = this.getFriendsLists();

        this.mainList.setFriends(main);
        this.favoriteList.setFriends(favorite);
    }

}

const app = new FriendApp(appId);

