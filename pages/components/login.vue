<template>
	<view v-if="login_user.show" class="login-view">
		<view v-if="!isEdit">
			<view class="login-button">
				<view class="add-btn login" @click="loginNew">登录</view>
				<view class="cancel-btn login" @click="login_user.show = false">取消</view>
			</view>
		</view>
		<view v-else>
			<button open-type="chooseAvatar" @chooseavatar="onChooseAvatar" class="avatar-div">
				<image :src="avatarUrl"></image>
			</button> 
			<input type="nickname" class="att-input" style="margin-top: 32rpx;" v-model="nickName" placeholder="请输入昵称" @blur="nickNameReview"/>
			<view class="add-btn" style="margin-top: 32rpx;" @click="loginWithInfo">授权并登录</view>
		</view>
	</view>
</template>

<script setup>
	import {ref, reactive, toRefs} from 'vue'
	import {login_user} from '@/common/answer.js'
	import {User} from '@/common/common.js'
	const isEdit = ref(false)
	const userInfo = reactive({nickName: '', avatarUrl: ''})
	const {nickName, avatarUrl} = toRefs(userInfo)
	
	
	function onChooseAvatar(e) {
		userInfo.avatarUrl = e.detail.avatarUrl
	}
	function nickNameReview(e) {
		userInfo.nickName = e.detail.value
	}
	function loginNew() {
		try {
			new User().loginNew().then(res => {
				if (res === 'success') {
					login_user.show = false
					login_user.response = true
				} else {
					new User().toast('请重新授权用户信息!')
					isEdit.value = true
				}
			})
		} catch(e) {
			new User().toast('登陆失败！')
		}
	}
	function loginWithInfo() {
		if (userInfo.nickName && userInfo.avatarUrl) {
			try {
				new User().newUser(userInfo.nickName, userInfo.avatarUrl).then(res => {
					login_user.show = false
					login_user.response = true
					isEdit.value = false
					userInfo.avatarUrl = ''
					userInfo.nickName = ''
				})
			} catch(e) {
				new User().toast('登陆失败！')
				userInfo.avatarUrl = ''
				userInfo.nickName = ''
			}
		} else {
			new User().toast('请填写用户信息!')
		}

	}
</script>

<style scoped>
	.login-view {
		position: fixed;
		top: 0;
		right: 0;
		left: 0;
		bottom: 0;
		background-color: #ffffff;
		z-index: 999;
		animation: post-list-row .03s;
	}
	@keyframes post-list-row {
		0% {top: 100%}
		100% {top: 0}
	}
	.login-button{
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 100%;
	}
	.login-button .login {
		width: 60%; margin: 64rpx auto;
	}
	.avatar-div {
		margin: 16rpx;
		width: auto;
		padding: 100rpx 0;
		line-height: 0;
	}
	.avatar-div image {
		width: 300rpx;
		height: 300rpx;
		border-radius: 30%;
		background-color: #8DAA913A;
		border: 1px solid #EBEEF5
	}
</style>