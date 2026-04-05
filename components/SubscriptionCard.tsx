import { View, Text, Image, Pressable } from 'react-native'
import React from 'react'
import { formatCurrency, formatStatusLabel, formatSubscriptionDateTime } from '@/lib/utils'
import { clsx } from 'clsx'


const SubscriptionCard = ({status,startDate,paymentMethod,expanded,onPress,name,price,currency,icon,billing,color,category,plan,renewalDate}:SubscriptionCardProps) => {
  return (
    <Pressable onPress={onPress}className={clsx('sub-card',expanded? 'sub-card-expanded': 'bg-card')} style={color ?{backgroundColor:color}: undefined}>
    
        
      <View className='sub-head'>

        <View className="sub-main">
            <Image source={icon} className='sub-icon'  >
            </Image>
            <View className='sub-copy'>
                <Text numberOfLines={1} className='sub-title'>
                    {name}
                </Text>
                <Text numberOfLines={1} ellipsizeMode='tail' className='sub-meta'>
                    {category ?.trim() || plan?.trim() || (renewalDate? formatSubscriptionDateTime(renewalDate): "")}
                </Text>
            </View>
        </View> 
        <View className='sub-price-box'>
            <Text className='sub-price'>
                {formatCurrency(price,currency)}        
            </Text>
            <Text className='sub-billing'>
                {billing}
            </Text>

        </View>
      </View>
      {expanded && (
        <View className='sub-expanded'>
            <View className="sub-details">
                    
               <View className="sub-row">
                    <View className="sub-row-copy">
                        <Text className="sub-label">Payment Method</Text>
                        <Text className="sub-value" numberOfLines={1} ellipsizeMode='tail'>
                            {paymentMethod?.trim() || "Not provided"}
                            </Text>
                    </View>
                </View>
               
                <View className="sub-row">
                    <View className="sub-row-copy">
                        <Text className="sub-label">Category</Text>
                        <Text className="sub-value" numberOfLines={1} ellipsizeMode='tail'>
                            {category?.trim() || plan?.trim() || "Not provided"}
                            </Text>
                    </View>
                </View>

                <View className="sub-row">
                    <View className="sub-row-copy">
                        <Text className="sub-label">Started</Text>
                        <Text className="sub-value" numberOfLines={1} ellipsizeMode='tail'>
                            {startDate ? formatSubscriptionDateTime(startDate) : "Not provided"}
                            </Text>
                    </View>
                </View>

                <View className="sub-row">
                    <View className="sub-row-copy">
                        <Text className="sub-label">Renewal Date:</Text>
                        <Text className="sub-value" numberOfLines={1} ellipsizeMode='tail'>
                            {renewalDate ? formatSubscriptionDateTime(renewalDate) : "Not provided"}
                            </Text>
                    </View>
                </View>


                <View className="sub-row">
                    <View className="sub-row-copy">
                        <Text className="sub-label">Status:</Text>
                        <Text className="sub-value" numberOfLines={1} ellipsizeMode='tail'>
                            {status ? formatStatusLabel(status) : ""}
                            </Text>
                    </View>
                </View>
         
      

            </View>
            

        </View>
        

   
      )}
    </Pressable>
  )
}

export default SubscriptionCard