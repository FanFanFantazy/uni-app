class Media{
	constructor () {}
	open(count = 1, mediaType = 'image') {
		return new Promise((resolve, reject) => {
			wx.chooseMedia({
				count,
				mediaType: [mediaType],
				sourceType: ['album', 'camera'],
				maxDuration: 30,
				camera: 'back'
			}).then((res) => {
				resolve(res.tempFiles)
			}).catch((err) => {
				reject(err)
			})
		})
	}
	upload (route, folder) {
		let imgion = route.lastIndexOf('.')
		let eximg = route.slice(imgion)
		let cloudPath = `${Date.now()}-${Math.floor(Math.random(0, 1) * 100000)}${eximg}`
		return new Promise((resolve, reject) => {
			wx.cloud.uploadFile({
				cloudPath: folder + cloudPath,
				filePath: route
			}).then(res => {
				resolve(res)
			}).catch(err => {
				reject(err)
			})
		})
	}
	preview(current = '', urls = []) {
		return new Promise((resolve, reject) => {
			wx.previewImage({
				current,
				urls
			}).then((res) => {
				resolve(res)
			}).catch(err => {
				reject(err)
			})
		}) 
	}
	delete(fileList = []) {
		return new Promise((resolve, reject) => {
			wx.cloud.deleteFile({fileList: fileList}).then((res) => {
				resolve(res)
			}).catch(err => {
				reject(err)
			})
		}) 
	}
}

class Formate {
	constructor () {}
	formateTime(time) {
		let temp = new Date(time)
		let month = (temp.getMonth() + 1) > 9 ? (temp.getMonth() + 1) : '0' + (temp.getMonth() + 1)
		return `${temp.getFullYear()}-${month}-${temp.getDate()} ${temp.getHours()}:${temp.getMinutes()}:${temp.getSeconds()}`
	}
}

// user
wx.cloud.init()
const db = wx.cloud.database()
const userdb = db.collection('user')
class User {
	constructor () {}
	loginNew() {
		return new Promise((resolve, reject) => {
			userdb.get().then(res => {
				if (res.data.length > 0) {
					const user = res.data[0]
					wx.setStorageSync('user_info', {avatarUrl: user.avatarUrl, nickName: user.nickName, _openid: user._openid})
					resolve('success')
				} else {
					resolve('no user')
				}
			}).catch(err =>{
				reject(err)
			})
		})
	}
	newUser(nickName, avatarUrl) {
		return new Promise(async (resolve, reject) => {
			await userdb.add({data: {
				avatarUrl: avatarUrl, 
				nickName: nickName, 
				watch_num: 1,
				pay: true
			}})
			await userdb.get().then(res => {
				const user = res.data[0]
				wx.setStorageSync('user_info', {avatarUrl: user.avatarUrl, nickName: user.nickName, _openid: user._openid})
				resolve('success')
			}).catch(err => {
				reject(err)
			})
		})
	}
	// login() {
	// 	return new Promise((resolve, reject) => {
	// 		wx.getUserProfile({desc: '用于登录'}).then(async (res) => {
	// 			const query_id = await userdb.get()
	// 			if (query_id.data.length > 0) {
	// 				const user = query_id.data[0]
	// 				wx.setStorageSync('user_info', {avatarUrl: user.avatarUrl, nickName: user.nickName, _openid: user._openid})
	// 			} else {
	// 				await userdb.add({data: {
	// 					avatarUrl: res.userInfo.avatarUrl, 
	// 					nickName: res.userInfo.nickName, 
	// 					watch_num: 1,
	// 					pay: true
	// 				}})
	// 				const query = await userdb.get() 
	// 				const user = query.data[0]
	// 				wx.setStorageSync('user_info', {avatarUrl: user.avatarUrl, nickName: user.nickName, _openid: user._openid})
	// 			}
	// 			resolve('success')
	// 		}).catch(err => {
	// 			reject(err)
	// 		})
	// 	})
	// }
	logout() {
		return new Promise((resolve, reject) => {
			userdb.get().then(res => {
				if (res.data.length > 0) {
					userdb.doc(res.data[0]._id).remove({})
				}
				wx.removeStorage({key: 'user_info'})
				resolve(res)
			}).catch(err => {
				reject(err)
			})
		})
	}
	toast(title, icon='none') {
		wx.showToast({
			title,
			icon,
			mask: true,
			duration: 800
		})
	}
}

export {Media, Formate, User}