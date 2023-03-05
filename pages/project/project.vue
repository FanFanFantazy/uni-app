<template>
	<view v-if="user">
		<view class="fixed-bottom">
			<view class="add-btn" @click="show = true"><text class="icon-plus"></text></view>
		</view>
		<block v-for="(item, index) in mainList" :key="index">
			<view class="item-card"  @click.native.stop="navigatToItem(item)">
				<text class="item-name">{{'#' + (index + 1) + '. ' + item.name}}</text>
				<text class="icon-cross icon-btn" style="float: right;" @click.native.stop="removeItem(item, index)"></text>
				<view class="long-text item-desc">{{item.desc}}</view>
				<view class="item-time">{{formateTime(item.create_date)}}</view>
			</view>
		</block>
		<view class="empty-end"></view>
		<page-container :show="show" position="bottom" @clickoverlay="clickoverlay">
			<view>
				<view class="att-input">
					<input v-model="editForm.name" type="text" placeholder="Please enter project name.." placeholder-class="placeholder" cursor-spacing="50"/>
				</view>
				<view class="att-input">
					<input v-model="editForm.desc" type="text" placeholder="Please enter project desc.." placeholder-class="placeholder" cursor-spacing="50"/>
				</view>
				<view class="add-btn" @click="submitAdd">Submit</view>
				<view class="add-btn" @click="show = false">Cancel</view>
			</view>
		</page-container>
	</view>
	<Login></Login>
</template>

<script setup>
	
	import { onMounted, reactive, ref, toRefs, watch } from 'vue'
	import { Formate } from '@/common/common.js'
	import { onReachBottom } from '@dcloudio/uni-app'
	
	// login
	import { login_user } from '@/common/answer.js'
	// get user info
	import Login from '@/pages/components/login.vue' 
	
	const user = ref(false)
	onMounted(() => {
		if (checkUserLogin()) {
			user.value = true
			getProjectList()
		}
	})
	watch(() => login_user.response, (newVal, oldVal) => {
		user.value = newVal
		getProjectList()
	})
	function checkUserLogin() {
		if (!wx.getStorageSync('user_info')) {
			login_user.show = true
			return false
		}
		return true
	}
	// db
	wx.cloud.init()
	const db = wx.cloud.database()
	const project = db.collection('project')
	
	// get main list and functions
	const mainData = reactive({
		mainList: [],
		editForm: {}
	})
	const {mainList, editForm} = toRefs(mainData)
	function getProjectList() {
		queryList()
	}
	function queryList () {
		if (wx.getStorageSync('user_info')._openid) {
			wx.showLoading()
			let _openid = wx.getStorageSync('user_info')._openid
			project.where({'_openid': _openid}).limit(10).skip(Math.floor(mainData.mainList.length/10) * 10).get().then(res => {
				mainData.mainList = removeDuplicate([...mainData.mainList, ...res.data])
			}).finally(() => {
				wx.hideLoading()
			})
		} else {
			mainData.mainList = []
		}
	}
	onReachBottom (() => {
		queryList()
	})
	const show = ref(false)
	function submitAdd () {
		wx.showLoading()
		let send = {
		  name: mainData.editForm.name,
			desc: mainData.editForm.desc,
			create_date: new Date(),
			active: true,
		}
		project.add({data: send}).then(res => {
			send._id = res._id
			mainData.mainList.push(send)
		}).finally(() => {
			wx.hideLoading()
			show.value = false
		})
	}
	function clickoverlay(e) {
		show.value = false
	}
	const task = db.collection('task')
	function removeItem(item, index) {
		wx.showLoading()
		task.where({'project_id': item._id}).get().then(res => {
		  if (res.data.length > 0) {
				wx.hideLoading()
				return wx.showToast({
					title: 'Please remove task first',
					icon: 'none',
					duration: 2000
				}) 
		  } else {
			 project.doc(item._id).remove({}).then(res => {
				 mainData.mainList.splice(index, 1)
			 }).finally(() => {
				 wx.hideLoading()
			 })
		  }
		})

	}
	function navigatToItem (item) {
		wx.navigateTo({
			url: '/pages/project/task?id=' + item._id
		})
	}
	function formateTime (t) {
		return new Formate().formateTime(t)
	}
	function removeDuplicate (ary) {
		let obj = {}
		let temp = []
		ary.forEach(el => {
			if (!obj[el._id]) {
				obj[el._id] = true
				temp.push(el)
			}
		})
		return temp
	}
</script>

<style scoped>
.item-card {
  margin: 16rpx;
  padding: 16rpx 32rpx;
  border: 1px solid #DCDFE6;
  border-radius: 10rpx;
  font-size: 12px;
  box-shadow: 0 4rpx 24rpx 0 #8DAA913A;
}
.item-card .item-name {
  font-size: 18px;
  font-weight: 600;
	line-height: 52rpx;
  color: #606266;
}
.item-card .item-desc {
	font-size: 16px;
  height: 40rpx;
	line-height: 40rpx;
	color: #989796;
}
.item-card .item-time {
	height: 30rpx;
	line-height: 30rpx;
	color: #989796;
	text-align: end;
}

</style>