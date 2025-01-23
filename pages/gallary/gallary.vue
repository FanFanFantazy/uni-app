<template>
	<view>
		<view style="min-height: 100vh;">
			<view class="att-input search-input">
				<input v-model="fuzzySearch" type="text" placeholder="检索相关关键词" placeholder-class="placeholder" cursor-spacing="100"/>
			</view>
			<view class="camera-btn" @click="uploadImage">
				<text class="icon-camera"></text>
			</view>
			<view style="margin: 0 16rpx;">
				<view class="index-image" v-for="(img, index) in imageList" :key="img._id">
					<view class="main" >
						<image class="mini-image" :src="img.fileUrl" mode="aspectFill" @click="previewImage(img.fileUrl)"></image>
						<text class="icon-bin icon-btn delete-image" @click="deleteImage(img.fileUrl, img._id, index)"></text>
					</view>
					<view style="margin-bottom: 16rpx;">
						<view class="desc-text">Fly, bird, sing. Your song in tone-desert-bird! Hide it, you’re a fool,</view>
						<view>
							<view class="avatar-image">
								<image class="avatar" :src="img.avatar_url" mode="aspectFill"></image>
							</view>
							<text class="user-name long-text">{{img.nick_name}}</text>
							<text class="icon-heart" style="font-size: 10px;" :class="checkLikeImage(img._id) ? 'like' : 'dislike'"></text>
							<text class="like-num">{{setCheckLikeNum(987999964)}}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="empty-end">
			已经到底了
		</view>
	</view>
	<Login></Login>
</template>

<script setup>
	import { onMounted, reactive, ref, toRefs, watch } from 'vue'
	import {Media} from '@/common/common.js'
	// user login
	import Login from '@/pages/components/login.vue'
	import { login_user } from '@/common/answer.js'
	
	onMounted(() => {
		getImage()
	})

	function checkUserLogin() {
		if (!wx.getStorageSync('user_info')) {
			login_user.show = true
			return false
		}
		return true
	}
	
	// image operation

	wx.cloud.init()
	const db = wx.cloud.database()
	const imageTable = db.collection('image')
	const mainData = reactive({
		imageList: [],
		fuzzySearch: ''
	})
	const {imageList, fuzzySearch} = toRefs(mainData)
	
	// upload
	function uploadImage () {
		console.log(checkUserLogin())
		if(checkUserLogin()) {
			wx.showLoading()
			new Media().open().then(res => {
				 res.forEach(f => {
					new Media().upload(f.tempFilePath, 'indexImage/').then(res2 => {
						imageTable.add({data: {
						  cloud_path: res2.fileID,
							create_date: new Date(),
							nick_name: wx.getStorageSync('user_info').nickName,
							avatar_url: wx.getStorageSync('user_info').avatarUrl
						}}).then(res3 => {
							imageList.value.unshift({ fileUrl: res2.fileID, _id: res3._id, 
							nick_name: wx.getStorageSync('user_info').nickName, avatar_url: wx.getStorageSync('user_info').avatarUrl })
						}).finally(() => {
							wx.hideLoading()
						})
					})
				})
			}).catch(() => {
				wx.hideLoading()
			}).finally(() => {
				getImage()
			})
		}

	}

	function getImage () {
		wx.showLoading()
		// imageTable.orderBy('create_date', 'desc').get().then((res) => {
		// 	imageList.value = res.data.map(o => {return {fileUrl: o.cloud_path, ...o}})
		// }).finally(() => {
		// 	wx.hideLoading()
		// })
		wx.cloud.callFunction({
			name: 'media',
			data: {
				action: 'getImage',
			}
		}).then((res) => {
			console.log(res.result)
			imageList.value = res.result.data.map(o => {return {fileUrl: o.cloud_path, ...o}})
		}).finally(() => {
			wx.hideLoading()
		})
	}
	function previewImage (url) {
		let urls = []
		urls = imageList.value.map(f => {return f.fileUrl})
		new Media().preview(url, urls)
	}
	// like
	function checkLikeImage(id) {
		return false
	}
	function setCheckLikeNum(num) {
		if (!num) {
			return 0
		} else if (num >0 && num<1000) {
			return num
		} else if (num >= 1000 && num < 1000000) {
			return Math.floor(num/1000) + 'k'
		} else if (num >= 1000000 && num < 1000000000) {
			return Math.floor(num/1000000) + 'm'
		} else {
			return '1b+'
		}
	}
	function deleteImage (url, _id, index) {
		wx.showLoading()
		new Media().delete([url]).then(res => {
			imageTable.doc(_id).remove({}).then(res2 => {
				imageList.value.splice(index, 1)
			}).then(() => {
				wx.cloud.deleteFile({fileList: [url]}).then(() => {
					wx.showToast({title: '删除成功'})
				}).catch(() => {
					wx.showToast({title: '删除失败'})
				})
			}).finally(() => {
				wx.hideLoading()
			})
		})
	}
</script>
<style scoped>
	.index-image {
		display: inline-block;
		width: calc(50% - 16rpx);
		vertical-align: top;
		margin: 8rpx;
		background-color: #8DAA9133;
		border-radius: 16rpx;
	}
	.index-image .main {
		width: 100%;
		height: 500rpx;
		position: relative;
	}
	.index-image .main .mini-image {
		width: 100%;
		height: 100%;
		border-top-left-radius: 16rpx;
		border-top-right-radius: 16rpx;
	}
	.index-image .avatar-image {
		border-radius: 50%;
		display: inline-block;
		padding: 0 8rpx 0 16rpx;
		width: 50rpx;
		height: 50rpx;
		vertical-align: middle;
	}
	.index-image .avatar-image .avatar {
		border-radius: 50%;
		width: 50rpx;
		height: 50rpx;
	}
	.index-image .user-name {
		line-height: 50rpx;
		vertical-align: middle;
		width: calc(100% - 175rpx);
		display: inline-block;
		font-size: 10px;
		color: #909399;
		margin-right: 8rpx
	}
	.like-num {
		margin-left: 8rpx;
		line-height: 50rpx;
		vertical-align: middle;
		width: 66rpx;
		display: inline-block;
		font-size: 9px;
		color: #909399;
	}
	.index-image .delete-image {
		position: absolute;
		z-index: 10;
		right: 0rpx;
	}
	.index-image .desc-text {
		font-size: 12px;
		color: #28112B;
		display: -webkit-box;
		overflow: hidden;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		text-overflow: ellipsis;
		margin: 8rpx 16rpx;
	}
	.search-input{
		width: calc(100% - 156rpx);
		display: inline-block;
		margin-right: 0;
	}
	.camera-btn{
		display: inline-block;
		height: 80rpx;
		width: 80rpx;
		background-color: #f7f7f7;
		margin: 16rpx 16rpx 16rpx 0;
		vertical-align: top;
		line-height: 80rpx;
		text-align: center;
	}
	.camera-btn .icon-camera {
		font-size: 40rpx;
		color: #909399;
	}
</style>

