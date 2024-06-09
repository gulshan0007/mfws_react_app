import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Linking, ImageSourcePropType } from 'react-native';
import iitbLogo from '../assets/iitb.png';
import csLogo from '../assets/cs.png';
import hdfcLogo from '../assets/hdfc.png';
import mcmrLogo from '../assets/mcmr.png';
import instagramIcon from '../assets/instagram.png';
import twitterIcon from '../assets/twitter.png';
import youtubeIcon from '../assets/youtube.png';
import facebookIcon from '../assets/facebook.png';

const ProfileScreen: React.FC = () => {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.paragraph}>
                {'\n\n'}
                Climate Studies at IIT Bombay, in collaboration with HDFC Ergo, hopes to harness the power of social media to monitor Mumbai floods by taking help from its residents and asking them to post details about floods in their neighborhoods, and collecting this data to issue real-time geographically-specific flood alerts/warnings. The gathered data shall be used to improve flood emergency response and rescue efforts, and help develop accurate flood forecasts in the future.
                {'\n\n'}
                Real-time information at hand can help save lives during disasters. At best, we hope to help Mumbaikars plan their monsoon days effectively. Our ultimate aim is to create a flood resilience plan for the Mumbai metropolitan region.
            </Text>
            <Text style={styles.header}>WHO WE ARE</Text>
            <View style={styles.section}>
                <Text style={styles.subHeader}>Implementing Partners</Text>
                <View style={styles.partners}>
                    <Image source={iitbLogo} style={styles.partnerImage} />
                    <Image source={csLogo} style={styles.partnerImage} />
                </View>
            </View>
            <View style={styles.section}>
                <Text style={styles.subHeader}>Sponsoring Partner</Text>
                <View style={styles.partners}>
                    <Image source={hdfcLogo} style={styles.partnerImage} />
                </View>
            </View>
            <View style={styles.section}>
                <Text style={styles.subHeader}>Project Partners</Text>
                <View style={styles.partners}>
                    <Image source={mcmrLogo} style={styles.partnerImage} />
                </View>
            </View>
            <View style={styles.iitTeam}>
                <Text style={styles.subHeader}>IIT Bombay Team</Text>
                <View style={styles.teamList}>
                    <Text style={styles.teamMember}>Prof. Subimal Ghosh</Text>
                    <Text style={styles.teamMember}>Prof. Raghu Murtugudde</Text>
                    <Text style={styles.teamMember}>Dr. Aniket Navalkar</Text>
                    <Text style={styles.teamMember}>Dr. Mayank Gupta</Text>
                    <Text style={styles.teamMember}>Dr. Sanghita Basu</Text>
                    <Text style={styles.teamMember}>Puja Tripathy</Text>
                </View>
                <Text style={styles.teamNote}>
                    Website & App developed by{'\n'}IIT Bombay students, Deepak{'\n'}Silaych & Gulshan Kumar
                    {'\n\n'}
                </Text>
            </View>
            <View style={styles.socialMediaIcons}>
                <TouchableOpacity onPress={() => Linking.openURL('https://www.instagram.com')}>
                    <Image source={instagramIcon} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL('https://x.com/ClimateIITB')}>
                    <Image source={twitterIcon} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL('https://www.youtube.com/@IDPinClimateStudiesIITBombay')}>
                    <Image source={youtubeIcon} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL('https://www.facebook.com/IITBclimate')}>
                    <Image source={facebookIcon} style={styles.icon} />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EDF0F2',
        padding: 20,
    },
    paragraph: {
        fontSize: 16,
        marginBottom: 20,
        color: 'black',
        fontStyle: 'italic',
    },
    header: {
        textAlign: 'center',
        backgroundColor: '#F6B800',
        paddingVertical: 10,
        fontWeight: 'bold',
        color: 'black',
        fontSize: 18,
        marginBottom: 20,
    },
    section: {
        marginBottom: 20,
    },
    subHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'black',
        display: 'flex', // Ensure the parent container is a flex container
        alignItems: 'center',
    },
    partners: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    partnerImage: {
        height: 100,
        width: 100,
        resizeMode: 'contain',
    },
    iitTeam: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 5,
        
    },
    teamList: {
        marginBottom: 10,
        
    },
    teamMember: {
        fontSize: 16,
        marginBottom: 5,
        color: 'black',
    },
    teamNote: {
        fontSize: 14,
        color: 'black',
        fontStyle: 'italic',
    },
    socialMediaIcons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        gap: 10,
        marginBottom: 30,
    },
    icon: {
        width: 40,
        height: 40,
    },
});

export default ProfileScreen;
