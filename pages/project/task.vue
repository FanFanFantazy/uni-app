<template>
	<view>
		<view class="fixed-bottom" style="height: 170rpx;">
		  <view class="add-btn" @click="show = true"><text class="icon-plus"></text></view>
		</view>
		<view class="sum-div">
			<text>总预期收益: {{calcTotal('est_payback')}}元</text>
			<text>总实际收益: {{calcTotal('act_payback')}}元</text>
		</view>
		<block v-for="(item, index) in mainList" :key="index">
			<view class="item-card">
				<text class="item-name">{{'#' + (index + 1) + '. ' + item.name}}</text>
				<text :class="item.type === '支出' ? 'item-type decreasebg' : 'item-type increasebg'">{{item.type}}</text>
				<text class="icon-cross icon-btn" style="float: right;" @click="removeItem(item, index)"></text>
				<view :class="item.type === '支出' ? 'item-investment decrease' : 'item-investment increase'">{{(item.type === '支出' ? '-' : '') + item.investment}}元</view>
				<view class="item-desc">{{item.desc}}</view>
				<view class="item-time">{{formateTime(item.start_date)}}</view>
				<view>
					<text class="item-subtitle">实际:<text class="item-act_payback">{{item.act_payback}}</text>元</text>
					<text class="item-subtitle">预期:<text class="item-est_payback">{{item.est_payback}}</text>元</text>
					<text class="item-subtitle">第<text class="item-est_payback_period">{{item.date_span}}</text>天</text>
					<text class="icon-file-text icon-btn" style="float: right;" @click="openDetail(item)"></text>
				</view>
			</view>
		</block>
		<view class="empty-end"></view>
		<!-- popover -->
		<page-container :show="show" position="bottom" @clickoverlay="clickoverlay">
			<view>
				<view class="att-input">
					<input v-model="editForm.name" type="text" placeholder="Please enter name..." placeholder-class="placeholder" cursor-spacing="100"/>
				</view>
				<picker class="att-input" mode="selector" @change="pickerChange"	:value="typeOp.indexOf(editForm.type)" :range="typeOp">
					<view :class="editForm.type ? '' : 'placeholder'">{{editForm.type || "Please select type..."}}</view>
				</picker>
				<view class="att-input">
					<input v-model="editForm.investment" type="number" placeholder="Please enter inverstment..." placeholder-class="placeholder" cursor-spacing="100"/>
				</view>
				<view class="att-input">
					<input v-model="editForm.desc" type="text" maxlength="-1" placeholder="Please enter desc..." placeholder-class="placeholder" cursor-spacing="100"/>
				</view>
				<view class="add-btn" @click="submitAdd">Submit</view>
				<view class="add-btn" @click="show = false">Cancel</view>
			</view>
			<view class="empty-end"></view>
		</page-container>
	</view>
</template>

<script setup>
	
	import { onMounted, reactive, ref, toRefs } from 'vue'
	import { onLoad, onShow } from '@dcloudio/uni-app'
	import { Formate } from '@/common/common.js'
	
	// db
	wx.cloud.init()
	const db = wx.cloud.database()
	// get main list and functions
	const mainData = reactive({
		mainList: [],
		projectId: '',
		editForm: {},
		typeOp: ['收入', '支出']
	})
	const {mainList, projectId, editForm, typeOp} = toRefs(mainData)
	
	onLoad((e) =>{
		mainData.projectId = e.id
	})
	onShow(() => {
		queryList()
	})
	
	function formateTime (t) {
		return new Formate().formateTime(t)
	}
	
	function queryList () {
		wx.showLoading()
		wx.cloud.callFunction({
			name: 'project',
			data: {
				action: 'getTaskList',
				data: { 'projectId': mainData.projectId }
			}
		}).then(res => {
			mainData.mainList = res.result.data
			console.log(mainData.mainList)
		}).finally(() => {
			wx.hideLoading()
		})
	}
	const imageTable = db.collection('task_image')
	function removeItem(item, index) {
		wx.showLoading()
		imageTable.where({'task_id': item._id}).get().then((res) => {
			if (res.data.length > 0) {
				wx.hideLoading()
				return wx.showToast({
					title: '请先删除相关附件',
					icon: 'none',
					duration: 2000
				})
			} else {
				wx.cloud.callFunction({
					name: 'project',
					data: {
						action: 'deleteTask',
						data: { _id: item._id }
					}
				}).finally(() => {
					queryList()
				})
			}
		})
		
	}
	function naviBack() {
		wx.navigateBack({
		  delta: 1
		})
	}
	// add
	const show = ref(false)
	function pickerChange(e) {
	  mainData.editForm.type = mainData.typeOp[e.detail.value]
	}
	function submitAdd () {
		wx.showLoading()
		wx.cloud.callFunction({
			name: 'project',
			data: {
				action: 'addTask',
				data: {
					name: mainData.editForm.name,
					type: mainData.editForm.type,
					est_payback: mainData.editForm.investment,
					act_payback: mainData.editForm.investment,
					investment: mainData.editForm.investment,
					project_id: mainData.projectId,
					desc: mainData.editForm.desc
				}
			}
		}).finally(() => {
			show.value = false
			queryList()
		})
	}
	function clickoverlay(e) {
		show.value = false
	}
	// open detail
	function openDetail (item) {
		wx.navigateTo({
			url: '/pages/project/task-dtl?id=' + (item._id || null)
		})
	}
	// sum
	function calcTotal(prop) {
		let sum = 0
		mainData.mainList.forEach(el => {
			let num = JSON.parse(el[prop])
			if (el.type === '支出') {
				sum -= num
			} else {
				sum += num
			}
		})
		return sum.toFixed(2)
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
  color: #606266;
	height: 50rpx;
	line-height: 50rpx;
}
.item-card .item-type {
  font-size: 14px;
  color: #909399;
  padding: 4rpx 16rpx;
  background-color: #e0e0e0;
  border-radius: 16rpx;
  margin-left: 16rpx;
	vertical-align: text-bottom;
}
.item-card .item-investment {
  font-size: 28px;
  color: #409EFF;
  line-height: 120rpx
}
.item-card .increase {
	color: #67C23A;
}
.item-card .decrease {
	color: #F56C6C;
}
.item-card .increasebg {
	color: #ffffff;
	background-color: #67C23A;
}
.item-card .decreasebg {
	color: #ffffff;
	background-color: #F56C6C;
}
.item-card .item-act_payback {
  font-size: 14px;
  color: #67C23A;
}
.item-card .item-est_payback {
  font-size: 14px;
  color: #F56C6C;
}
.item-card .item-est_payback_period {
  font-size: 14px;
  color: #409EFF;
}
.item-card .item-subtitle{
  margin-right: 32rpx;
	line-height: 52rpx;
}

.item-card .item-desc {
  margin-bottom: 16rpx;
	line-height: 40rpx;
	color: #989796;
	display: -webkit-box;
	overflow: hidden;
	-webkit-line-clamp: 4;
	line-clamp: 4;
	-webkit-box-orient: vertical;
	text-overflow: ellipsis;
}

.item-card .item-time {
	color: #989796;
	margin-bottom: 16rpx;
}
.sum-div {
	padding: 16rpx 32rpx 0;
	display: flex;
	justify-content: space-between;
}
</style>