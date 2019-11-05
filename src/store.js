import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import firebase from 'firebase';
import router from '@/router';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        recipes: [],
        apiUrl: 'https://api.edamam.com/search',
        user: null,
        isAuthenticated: false,
        userRecipes: []
    },
    mutations: {
        setRecipes (state, payload) {
            state.recipes = payload
        },
        setUser (state, payload) {
            state.user = payload
        },
        setIsAuthenticated (state, payload) {
            state.isAuthenticated = payload
        },
        setUserRecipes (state, payload) {
            state.userRecipes = payload
        }
    },
    actions: {
        async getRecipes ({ state, commit }, plan) {
            const API_ID = 'cd304163';
            const API_KEY = '88f7f5c4da5528dc3326914301c6030b';
            try {
                let response = await axios.get(`${state.apiUrl}`, {
                    params: {
                        q: plan,
                        app_id: API_ID,
                        app_key: API_KEY,
                        from: 0,
                        to: 9
                    }
                });
                commit('setRecipes', response.data.hits);
            } catch (error) {
                commit('setRecipes', []);
            }
        },
        userJoin ({ commit }, { email, password }) {
            firebase
                .auth().createUserWithEmailAndPassword(email, password)
                .then(user => {
                    commit('setUser', user);
                    commit('setIsAuthenticated', true);
                    router.push('/about')
                })
                .catch(() => {
                    commit('setUser', null);
                    commit('setIsAuthenticated', false);
                    router.push('/')
                });
        },
        userLogin ({ commit }, { email, password }) {
            firebase
                .auth().signInWithEmailAndPassword(email, password)
                .then(user => {
                    commit('setUser', user)
                    commit('setIsAuthenticated', true)
                    router.push('/about')
                })
                .catch(() => {
                    commit('setUser', null)
                    commit('setIsAuthenticated', false)
                    router.push('/')
                })
        },
        userSignOut ({ commit }) {
            firebase
                .auth().signOut()
                .then(() => {
                    commit('setUser', null)
                    commit('setIsAuthenticated', false)
                    router.push('/')
                })
                .catch(() => {
                    commit('setUser', null)
                    commit('setIsAuthenticated', false)
                    router.push('/')
                })
        },
        addRecipe ({ state }, payload) {
            // usersというテーブルにレシピの名前を格納する
            firebase
                .database()
                .ref('users')
                .child(state.user.user.uid)
                .push(payload.recipe.label)
        },
        getUserRecipes ({ state, commit }) {
            // dbの一意ユーザーIDを用いて全てのレシピを取得し、setUserRecipesを呼び出す
            return firebase
                .database()
                .ref('users/' + state.user.user.uid)
                .once('value', snapshot => {
                    commit('setUserRecipes', snapshot.val());
                });
        }
    },
    getters: {
        recipes: state => state.recipes,
        isAuthenticated: state => state.isAuthenticated
    }
});
