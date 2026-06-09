import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#141414' 
  },
  center: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  backBtn: { 
    padding: 16 
  },
  backText: { 
    color: '#E50914', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  bannerPoster: { 
    width: '100%', 
    height: 300, 
    backgroundColor: '#000000' 
  },
  infoWrapper: { 
    padding: 20 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    marginBottom: 10 
  },
  metaRow: { 
    flexDirection: 'row', 
    gap: 15, 
    marginBottom: 10, 
    alignItems: 'center' 
  },
  metaText: { 
    color: '#AAAAAA', 
    fontSize: 14 
  },
  ratingText: { 
    color: '#FFD700', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  genre: { 
    color: '#E50914', 
    fontWeight: '600', 
    marginBottom: 20 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    marginTop: 15, 
    marginBottom: 6 
  },
  plot: { 
    color: '#CCCCCC', 
    fontSize: 15, 
    lineHeight: 22 
  },
  
  // ================= UTALITI BUTANG KONGSI =================
  btnBase: { 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  btnTextBase: { 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  watchlistBtn: { 
    marginVertical: 10, 
    borderWidth: 1 
  },
  watchlistBtnInactive: { 
    backgroundColor: '#E50914', 
    borderColor: '#E50914' 
  },
  watchlistBtnActive: { 
    backgroundColor: '#262626', 
    borderColor: '#555555' 
  },
  watchlistTextInactive: { 
    color: '#FFFFFF' 
  },
  watchlistTextActive: { 
    color: '#E50914' 
  },

  // ================= SEKSYEN KOMEN =================
  commentSection: { 
    marginTop: 25, 
    borderTopWidth: 1, 
    borderTopColor: '#2A2A2A', 
    paddingTop: 15 
  },
  commentInput: { 
    backgroundColor: '#222222', 
    color: '#FFFFFF', 
    padding: 12, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#333333', 
    minHeight: 80, 
    textAlignVertical: 'top', 
    marginTop: 8 
  },
  buttonRow: { 
    flexDirection: 'row', 
    marginTop: 10, 
    gap: 10 
  },
  actionBtn: { 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    borderRadius: 6, 
    alignItems: 'center' 
  },
  saveBtn: { 
    backgroundColor: '#E50914' 
  },
  cancelBtn: { 
    backgroundColor: '#333333', 
    borderWidth: 1, 
    borderColor: '#555555' 
  },
  commentBox: { 
    backgroundColor: '#1F1F1F', 
    padding: 15, 
    borderRadius: 8, 
    marginTop: 8, 
    borderWidth: 1, 
    borderColor: '#2A2A2A' 
  },
  commentText: { 
    color: '#E5E5E5', 
    fontSize: 15, 
    lineHeight: 22, 
    fontStyle: 'italic' 
  },
  commentActionRow: { 
    flexDirection: 'row', 
    marginTop: 12, 
    gap: 20, 
    alignItems: 'center' 
  },
  textBtn: { 
    alignSelf: 'flex-start' 
  },
  editBtnText: { 
    color: '#E50914', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  deleteCommentText: { 
    color: '#FF4D4D', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  lockedCommentText: { 
    color: '#777777', 
    fontSize: 14, 
    fontStyle: 'italic', 
    textAlign: 'center', 
    lineHeight: 20 
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 4
  },
  commentUsername: {
    color: '#E50914',
    fontWeight: 'bold',
    fontSize: 14
  },
  commentDate: {
    color: '#777',
    fontSize: 12
  },
});