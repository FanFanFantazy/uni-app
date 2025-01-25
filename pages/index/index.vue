<template>
	<view style="margin: 16rpx">
		<view style="margin-bottom: 32rpx">
			<view class="avatar-div">
				<image :src="avatarUrl" mode="aspectFill"></image>
			</view>
			<view v-if="avatarUrl" class="user-info">
				<view class="name-div">
					{{nickName}}
				</view>
				<view class="user-intro long-text">
					{{userIntro || 'The world is gate To a thousand of dumb and cold deserts!'}}
				</view>
			</view>
		</view>
		<!-- usage -->
		<view style="margin-bottom: 32rpx">
			<view class="usage-card">
				<view class="space-between">
					<text class="usage-label">相册</text>
					<text class="usage-num">{{photo_act}}/{{photo_total}}张</text>
				</view>
				<view>
					<view class="process-act" :style="calcPercentage(photo_act, photo_total)"></view>
					<view class="process-total"></view>
				</view>
			</view>
			<view class="usage-card">
				<view class="space-between">
					<text class="usage-label">收藏</text>
					<text class="usage-num">{{like_act}}/{{like_total}}张</text>
				</view>
				<view>
					<view class="process-act" :style="calcPercentage(like_act, like_total)"></view>
					<view class="process-total"></view>
				</view>
			</view>
		</view>
		<!-- operations -->
		<view v-if="avatarUrl">
			<view class="menu-item"><text class="icon-image menu-icon"></text>我的相册</view>
			<view class="menu-item"><text class="icon-heart menu-icon"></text>我的收藏</view>
			<view class="menu-item" @click="navigateProject"><text class="icon-list menu-icon"></text>我的笔记</view>
			<view class="menu-item" @click="openlogout"><text class="icon-reply menu-icon"></text>退出登录</view>
		</view>
		<view v-else class="menu-item" @click="openLogin">重新登录</view>
		
	</view>
	<Login></Login>
</template>

<script setup>
	import { onMounted, reactive, ref, toRefs, watch } from 'vue'
	import { login_user } from '@/common/answer.js'
	// get user info
	import Login from '@/pages/components/login.vue'
	const userInfomation = reactive({
		nickName: '',
		avatarUrl: '',
		userIntro: ''
	})
	const {nickName, avatarUrl, userIntro} = toRefs(userInfomation)
	onMounted(() => {
		openLogin()
	})

	watch(() => login_user.response, (newVal, oldVal) => {
		if (newVal) {
			userInfomation.nickName = wx.getStorageSync('user_info').nickName
			userInfomation.avatarUrl = wx.getStorageSync('user_info').avatarUrl
		} else {
			userInfomation.nickName = ''
			userInfomation.avatarUrl = ''
		}
	})
	function openLogin() {
		if (!wx.getStorageSync('user_info')) {
			login_user.show = true
			return false
		} else {
			userInfomation.nickName = wx.getStorageSync('user_info').nickName
			userInfomation.avatarUrl = wx.getStorageSync('user_info').avatarUrl
		}
	}
	import {User} from '@/common/common.js'
	function openlogout(){
		new User().logout().then(() => {
			login_user.show = true
			login_user.response = false
		})
	}
	// project
	function navigateProject () {
		wx.switchTab({
			url: '/pages/project/project'
		})
	}
	// usage
	const usageForm = reactive({
		photo_act: 40,
		photo_total: 100,
		like_act: 380,
		like_total: 500
	})
	const {photo_act, photo_total, like_act, like_total} = toRefs(usageForm)
	function calcPercentage(a, b) {
		let width = 0
		let color = ''
		if (a && b) {
			width = (a / b).toFixed(2) * 100
		}
		color = width < 50 ? '#67C23A' : width < 85 ? '#E6A23C' : '#F56C6C'
		return { width: width + '%', backgroundColor: color }
	}
</script>
<style scoped>
	.avatar-div {
		margin: 32rpx;
		text-align: center;
		display: inline-block;
		width: 96rpx;
		height: 96rpx;
		border-radius: 50%;
		background-color: #8DAA913A;
		border: 1px solid #EBEEF5
	}
	.avatar-div image {
		width: 96rpx;
		height: 96rpx;
		border-radius: 50%;
	}
	.name-div {
		font-size: 22px;
		text-align: left;
		font-weight: 600;
		margin-bottom: 8rpx;
		display: inline-block;
	}
	.user-info {
		display: inline-block;
		vertical-align: top;
		margin-top: 32rpx;
		width: calc(100% - 185rpx);
	}
	.user-intro {
		font-size: 12px;
		text-align: left;
		color: #606266
	}
	.menu-item {
		text-align: left;
		margin: 0 48rpx;
		padding: 40rpx 0;
		color: #303133;
		border-bottom: 1px solid #F2F6FC;
		line-height: 40rpx;
	}
	.menu-item .menu-icon {
		font-size: 18px;
		margin-right: 32rpx;
		line-height: 40rpx;
		vertical-align: text-bottom;
		color: #8DAA91;
		font-weight: 600;
	}
	
	.usage-card {
		display: inline-block;
		width: calc(50% - 82rpx);
		height: 100rpx;
		vertical-align: top;
		padding: 32rpx 32rpx 16rpx 48rpx;
	}
	.space-between{
		display: flex;
		justify-content: space-between;
		margin-bottom: 16rpx;
	}
	.usage-label {
		line-height: 40rpx;
	}
	.usage-num {
		font-size: 16px;
		line-height: 40rpx;
		font-weight: 600;
	}
	.process-total {
		height: 16rpx;
		border: 1px solid #F2F6FC;
		background-color: #EBEEF5;
		border-radius: 16rpx;
	}
	.process-act {
		height: 16rpx;
		border-radius: 16rpx;
		position: relative;
		margin-bottom: -16rpx;
	}
</style>

