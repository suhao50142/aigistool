const state = {
  opacity:{
    background: 'rgba(255, 255, 255, 0.8)'
  }
}

const mutations = {
  SET_OPACITY (state, value) {
    state.opacity={
      background: 'rgba(255, 255, 255, '+value+')'
    }
  }
}

const actions = {
  setOpacity({commit},value){
    commit('SET_OPACITY',value);
  }
}

const getters = {
  getOpacity: state => state.opacity
}

export default {
  state,
  mutations,
  actions,
  getters
}